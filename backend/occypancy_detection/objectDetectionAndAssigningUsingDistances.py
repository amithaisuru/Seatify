import os
import math
import cv2
import numpy as np
from cafeLayout import CafeLayout
from ultralytics import YOLO

import torch

# Check if MPS (Metal Performance Shaders) is available on M4 Pro
if torch.backends.mps.is_available():
    device = 'mps'
    print("Using MPS (GPU) acceleration on M4 Pro")
else:
    device = 'cpu'
    print("Using CPU")

# Create an output folder for annotated frames
output_dir = 'annotated_frames/video2'
os.makedirs(output_dir, exist_ok=True)

# Load models onto GPU
det_model  = YOLO('yolov8x.pt')
pose_model = YOLO('yolov8x-pose.pt')


def calculate_angle(a, b, c):
    #Builds vectors ba and bc around joint b.
    ba = a - b
    bc = c - b
    
    #Uses the dot-product formula to get the cosine of angle abc
    cosang = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc) + 1e-6)

    #clip to valid range and convert from radians to degrees
    return np.degrees(np.arccos(np.clip(cosang, -1.0, 1.0)))

# compute knee angle
def kneeAngleCondition(kpts):
    try:
        # compute left & right knee angles
        l_ang = calculate_angle(kpts[11,:2], kpts[13,:2], kpts[15,:2]) #computes left knee angles
        r_ang = calculate_angle(kpts[12,:2], kpts[14,:2], kpts[16,:2]) #computes right knee angles
        # compute average angle
        knee_angle = (l_ang + r_ang) / 2

        # Threshold to decide sitting vs standing
        if knee_angle < 110:
            return True
        else:
            return False
    except:
        pass  

#Compute torso lean: angle at the hip by shoulder→hip→knee
def torsoAngleCondition(kpts):
    try:
        left_torso  = calculate_angle(kpts[5,:2],  kpts[11,:2], kpts[13,:2])  # L-shoulder, L-hip, L-knee
        right_torso = calculate_angle(kpts[6,:2],  kpts[12,:2], kpts[14,:2])  # R-shoulder, R-hip, R-knee
        torso_angle = (left_torso + right_torso) / 2

        # Threshold to decide sitting vs standing
        if torso_angle < 110:
            return True
        else:
            return False

    except:
        pass  

#Hip‐knee level test: True if avg vertical distance between hip & knee is < 15% of crop height
def hipKneeLevelCondition(kpts, crop_height):
    try:
        dy_left  = abs(kpts[11,1] - kpts[13,1])
        dy_right = abs(kpts[12,1] - kpts[14,1])
        avg_dy   = (dy_left + dy_right) / 2

        return (avg_dy / crop_height) < 0.15
    except:
        return False

# __________________________________________________________*****************************************************
def assign_chairs_to_tables_by_distance(chair_boxes, table_boxes):
    """
    Assign chairs to tables based on Euclidean distance between centers
    
    Args:
        chair_boxes: List of [track_id, x1, y1, x2, y2, center_x, center_y]
        table_boxes: List of [track_id, x1, y1, x2, y2, center_x, center_y]
    
    Returns:
        dict: {chair_track_id: table_track_id} or {chair_track_id: None}
    """
    chair_to_table_mapping = {}
    
    for chair in chair_boxes:
        chair_id = chair[0]
        chair_center_x = chair[5]
        chair_center_y = chair[6]
        
        closest_table = None
        min_distance = float('inf')
        
        # Find the closest table to this chair
        for table in table_boxes:
            table_id = table[0]
            table_center_x = table[5]
            table_center_y = table[6]
            
            # Calculate Euclidean distance
            distance = math.sqrt((chair_center_x - table_center_x)**2 + 
                               (chair_center_y - table_center_y)**2)
            
            if distance < min_distance:
                min_distance = distance
                closest_table = table_id
        
        chair_to_table_mapping[chair_id] = closest_table
    
    return chair_to_table_mapping #dict: {chair_track_id: table_track_id}


# __________________________________________________________*****************************************************
def assign_seated_people_to_tables_by_distance(seated_people, table_boxes):
    """
    Assign seated people to tables based on Euclidean distance between centers
    
    Args:
        seated_people: List of [track_id, x1, y1, x2, y2, center_x, center_y]
        table_boxes: List of [track_id, x1, y1, x2, y2, center_x, center_y]
        max_distance: Maximum distance to consider a person belongs to a table
    
    Returns:
        dict: {person_track_id: table_track_id} or {person_track_id: None}
    """
    person_to_table_mapping = {}
    
    for person in seated_people:
        person_id = person[0]
        person_center_x = person[5]
        person_center_y = person[6]
        
        closest_table = None
        min_distance = float('inf')
        
        # Find the closest table to this seated person
        for table in table_boxes:
            table_id = table[0]
            table_center_x = table[5]
            table_center_y = table[6]
            
            # Calculate Euclidean distance
            distance = math.sqrt((person_center_x - table_center_x)**2 + 
                               (person_center_y - table_center_y)**2)
            
            if distance < min_distance:
                min_distance = distance
                closest_table = table_id
        
        person_to_table_mapping[person_id] = closest_table
    
    return person_to_table_mapping #dict: {person_track_id: table_track_id}

# __________________________________________________________*****************************************************
def analyze_table_occupancy(chair_table_mapping, person_table_mapping, table_boxes):
    """
    Analyze occupancy for each table
    
    Args:
        chair_table_mapping: dict {chair_track_id: table_track_id}
        person_table_mapping: dict {person_track_id: table_track_id}  
        table_boxes: List of [track_id, x1, y1, x2, y2, center_x, center_y]
    
    Returns:
        dict: {table_id: {'chairs': count, 'seated_people': count, 'center_x': int, 'center_y': int}}
    """
    table_occupancy = {}
    
    for table in table_boxes:
        table_id = table[0]
        table_center_x = table[5]  # Extract center coordinates
        table_center_y = table[6]
        
        # Count chairs assigned to this table
        assigned_chairs = [chair_id for chair_id, tid in chair_table_mapping.items() if tid == table_id]
        chair_count = len(assigned_chairs)
        
        # Count seated people assigned to this table
        assigned_people = [person_id for person_id, tid in person_table_mapping.items() if tid == table_id]
        people_count = len(assigned_people)
        
        table_occupancy[table_id] = {
            'table_id': table_id,                 # table ID
            'center_x': table_center_x,           # X coordinate of table center
            'center_y': table_center_y,           # Y coordinate of table center  
            'chair_count': chair_count,           # Number of chairs assigned to this table
            'seated_people_count': people_count,  # Number of seated people at this table
            'assigned_chairs': assigned_chairs,   # List of chair track IDs assigned to this table
            'assigned_people': assigned_people    # List of person track IDs seated at this table
        }

    return table_occupancy


def bbox_iou(box1, box2):
    x1, y1, x2, y2 = box1
    x1b, y1b, x2b, y2b = box2
    xi1, yi1 = max(x1, x1b), max(y1, y1b)
    xi2, yi2 = min(x2, x2b), min(y2, y2b)
    inter_w = max(0, xi2 - xi1)
    inter_h = max(0, yi2 - yi1)
    inter = inter_w * inter_h
    area1 = (x2 - x1) * (y2 - y1)
    area2 = (x2b - x1b) * (y2b - y1b)
    union = area1 + area2 - inter
    return inter / union if union > 0 else 0

IOU_THRESHOLD = 0.2

# Start the detection + track stream
stream = det_model.track(
    source=r'/Users/sadeepa/Desktop/Self Study/Seatify/Input Videos/video2.mp4',
    tracker='bytetrack.yaml',
    classes=[0,56, 60],
    persist=True,
    show=False,
    save=True,
    save_dir='outputs/',
    stream=True,
    device=device,          # Use MPS if available
    half=True,              # Use FP16 for faster inference on M4 Pro
    verbose=False           # Reduce console output for better performance
)

#process frames
for frameIndex, singleFrame in enumerate(stream): #enumerate(stream) gives (frame_idx, res) as soon as each frame is done
    cafe_layout = CafeLayout()

    frame = singleFrame.orig_img.copy() # copy of raw frame we annotate
    print(f"\n\n-----*****Frame {frameIndex}:")

    # Pull detections
    # Unpack the tracked detections in parallel arrays
    boxesXYXYs = singleFrame.boxes.xyxy.cpu().numpy() # bounding boxes (n×4)
    confs     = singleFrame.boxes.conf.cpu().numpy() # confidence scores (n) 
    cls_ids   = singleFrame.boxes.cls.cpu().numpy().astype(int) # class IDs (n)
    track_ids = singleFrame.boxes.id.cpu().numpy().astype(int) # track IDs (n)

    # Build a list of chairs in this frame
    # Build a list of chairs in this frame
    chair_boxes = []
    for (x1,y1,x2,y2), cls_id, track_id in zip(boxesXYXYs, cls_ids, track_ids):
        if singleFrame.names[cls_id] == 'chair':

            # __________________________________________________________*****************************************************
            # Calculate center point of the bounding box
            center_x = int((x1 + x2) / 2)
            center_y = int((y1 + y2) / 2)
            
            # __________________________________________________________*****************************************************
            # Store: [track_id, x1, y1, x2, y2, center_x, center_y]
            chairBoundingBox = list(map(int, (track_id, x1, y1, x2, y2, center_x, center_y)))
            chair_boxes.append(chairBoundingBox)
    
    # __________________________________________________________*****************************************************
    '''
    chair_boxes = [
    [track_id1, x1, y1, x2, y2, center_x1, center_y1],
    [track_id2, x1, y1, x2, y2, center_x2, center_y2],
    [track_id3, x1, y1, x2, y2, center_x3, center_y3],
    ... more chair detections]
    '''
    
    table_boxes = []
    for (x1,y1,x2,y2), cls_id, track_id in zip(boxesXYXYs, cls_ids, track_ids):
        if singleFrame.names[cls_id] == 'dining table':

            # __________________________________________________________*****************************************************
            # Calculate center point of the bounding box
            center_x = int((x1 + x2) / 2)
            center_y = int((y1 + y2) / 2)
            
            # __________________________________________________________*****************************************************
            # Store: [track_id, x1, y1, x2, y2, center_x, center_y]
            tableBoundingBox = list(map(int, (track_id, x1, y1, x2, y2, center_x, center_y)))
            table_boxes.append(tableBoundingBox)

    # __________________________________________________________*****************************************************
    '''
    table_boxes = [
    [track_id1, x1, y1, x2, y2, center_x1, center_y1],
    [track_id2, x1, y1, x2, y2, center_x2, center_y2],
    [track_id3, x1, y1, x2, y2, center_x3, center_y3],
    # ... more table detections
    ]
    '''

    # __________________________________________________________*****************************************************
    # Build a list of seated people in this frame
    seated_people = []

    #Iterate through each detection in this frame
    for (x1, y1, x2, y2), conf, cls_id, track_id in zip(boxesXYXYs, confs, cls_ids, track_ids): #Zips the four arrays so you handle each detection in lockstep.
        #Converts the box coords to integers
        x1, y1, x2, y2 = map(int, (x1, y1, x2, y2))

        #looks up the human-readable class name
        label = singleFrame.names[cls_id] # e.g. "person" or "chair"

        # Person branch
        if label == 'person':
            # Defaults the posture to “unknown” with a yellow box
            posture, color = 'unknown', (0,255,255)

            # Crops the detected person region and runs pose_model on that ROI
            roi = frame[y1:y2, x1:x2]
            p = pose_model(roi , verbose=False)[0]

            if p.keypoints is not None:
                # Extract the raw (n,17,3) tensor of keypoints
                kpts_np = p.keypoints.data.cpu().numpy()  # shape (n,17,3)

                # Ensure we have at least 17 keypoints
                if kpts_np.ndim == 3 and kpts_np.shape[0] > 0 and kpts_np.shape[1] >= 17:
                    kpts = kpts_np[0]  # first person
                    # shape (17,3): [x,y,conf] per joint

                    # Compute the knee angle
                    kneeAngleResult = kneeAngleCondition(kpts)

                    # Compute the torso angle
                    torsoAngleResult = torsoAngleCondition(kpts)

                    # Compute the hip-knee level condition
                    hipKneeLevelResult = hipKneeLevelCondition(kpts, crop_height=(y2-y1))
                    
                    if kneeAngleResult or torsoAngleResult:
                        posture, color = 'sitting',  (0,255,0)

                        # __________________________________________________________*****************************************************
                        # Calculate center point of the bounding box
                        center_x = int((x1 + x2) / 2)
                        center_y = int((y1 + y2) / 2)
                        
                        # __________________________________________________________*****************************************************
                        # Store seated person: [track_id, x1, y1, x2, y2, center_x, center_y]
                        seated_person = [track_id, x1, y1, x2, y2, center_x, center_y]
                        seated_people.append(seated_person)

                        '''
                        seated_people = [
                                [track_id1, x1, y1, x2, y2, center_x1, center_y1],
                                [track_id2, x1, y1, x2, y2, center_x2, center_y2],
                                [track_id3, x1, y1, x2, y2, center_x3, center_y3],
                                # ... more seated person detections
                            ]
                        '''

                    else:
                        posture, color = 'standing', (0,0,255)
                    
            text = f"{posture} {conf:.2f} ID:{track_id}"
            #cafe_layout.add_person(track_id, (x1, y1), (x2, y2), posture)

        # __________________________________________________________*****************************************************
        elif label == 'chair':
            color = (255,0,0)  # Blue for chairs
            text = f"chair {conf:.2f} ID:{track_id}"
        # __________________________________________________________*****************************************************  
        elif label == 'dining table':
            color = (0,255,255)  # Yellow for tables
            text = f"table {conf:.2f} ID:{track_id}"
        # __________________________________________________________*****************************************************
        else:
            # Skip other object types
            continue

        # __________________________________________________________*****************************************************
        # Draw & print
        cv2.rectangle(frame, (x1,y1), (x2,y2), color, 2)
        cv2.putText(frame, text, (x1, y1-10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)
        # print(f"  → {text}  box=[{x1},{y1},{x2},{y2}]")


    # cv2.imshow("Pose+Track", frame)
    # if cv2.waitKey(1) & 0xFF == ord('q'):
    #     break

    # __________________________________________________________*****************************************************
    print(len(chair_boxes), "chairs detected in this frame")
    print(len(table_boxes), "tables detected in this frame")
    print(len(seated_people), "seated people detected in this frame")


    # __________________________________________________________*****************************************************
    # Assign chairs to tables
    if len(chair_boxes) > 0 and len(table_boxes) > 0:
        chair_table_mapping = assign_chairs_to_tables_by_distance(chair_boxes, table_boxes)
        # chair_table_mapping => dict: {chair_track_id: table_track_id}
    
    # __________________________________________________________*****************************************************
    # Assign seated people to tables
    if len(seated_people) > 0 and len(table_boxes) > 0:
        person_table_mapping = assign_seated_people_to_tables_by_distance(seated_people, table_boxes)
        # person_table_mapping => dict: {person_track_id: table_track_id}

        # # Print the assignments
        # for person_id, table_id in person_table_mapping.items():
        #     if table_id is not None:
        #         # print(f"------Seated Person {person_id} assigned to Table {table_id}")
        #     else:
        #         # print(f"------Seated Person {person_id} not assigned to any table")

    
    # # Analyze table occupancy (only if we have both chairs and people assigned)
    # if len(chair_boxes) > 0 and len(table_boxes) > 0 and len(seated_people) > 0:
    #     # Ensure we have the mappings from previous assignments
    #     if 'chair_table_mapping' in locals() and 'person_table_mapping' in locals():
    #         table_occupancy = analyze_table_occupancy(chair_table_mapping, person_table_mapping, table_boxes)
            
    
    # elif len(table_boxes) > 0 and len(chair_boxes) > 0:
    #     # If we only have chairs but no seated people
    #     chair_table_mapping = assign_chairs_to_tables_by_distance(chair_boxes, table_boxes) if len(chair_boxes) > 0 else {}
    #     person_table_mapping = {}  # Empty mapping
        
    #     table_occupancy = analyze_table_occupancy(chair_table_mapping, person_table_mapping, table_boxes)
    
    # Replace the incomplete section (lines 402-416) with:


    # __________________________________________________________*****************************************************
    # Analyze table occupancy (only if we have both chairs and people assigned) 
    if len(chair_boxes) > 0 and len(table_boxes) > 0 and len(seated_people) > 0:
        # Ensure we have the mappings from previous assignments
        if 'chair_table_mapping' in locals() and 'person_table_mapping' in locals():
            table_occupancy = analyze_table_occupancy(chair_table_mapping, person_table_mapping, table_boxes)
            
            # Print table occupancy for this frame
            print("\n======= TABLE OCCUPANCY ANALYSIS =======")
            for table_id, data in table_occupancy.items():
                print(f"Table {table_id} at ({data['center_x']}, {data['center_y']}):")
                print(f"  - Chairs: {data['chair_count']} (IDs: {data['assigned_chairs']})")
                print(f"  - Seated People: {data['seated_people_count']} (IDs: {data['assigned_people']})")
                print()

    # __________________________________________________________*****************************************************       
    elif len(table_boxes) > 0 and len(chair_boxes) > 0:
        # If we only have chairs but no seated people
        chair_table_mapping = assign_chairs_to_tables_by_distance(chair_boxes, table_boxes) if len(chair_boxes) > 0 else {}
        person_table_mapping = {}  # Empty mapping
        
        table_occupancy = analyze_table_occupancy(chair_table_mapping, person_table_mapping, table_boxes)
        
        # Print table occupancy for this frame
        print("\n======= TABLE OCCUPANCY ANALYSIS =======")
        for table_id, data in table_occupancy.items():
            print(f"Table {table_id}:")
            print(f"  - Chairs: {data['chair_count']} (IDs: {data['assigned_chairs']})")
            print(f"  - Seated People: {data['seated_people_count']} (IDs: {data['assigned_people']})")
            print()

    # __________________________________________________________*****************************************************     
    else:
        # No tables or no chairs detected
        print("\n======= TABLE OCCUPANCY ANALYSIS =======")
        print("No tables or chairs detected in this frame - cannot analyze occupancy")
        print()


    
    # __________________________________________________________*****************************************************
    print("=" * 50)  # Separator between frames

    # Add frame information overlay
    cv2.putText(frame, f"Frame: {frameIndex}", (10, 30),
                cv2.FONT_HERSHEY_SIMPLEX, 1, (255,255,255), 2)
    cv2.putText(frame, f"Tables: {len(table_boxes)} | Chairs: {len(chair_boxes)} | Seated: {len(seated_people)}", 
                (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255,255,255), 2)

    # Save the annotated frame
    frame_filename = os.path.join(output_dir, f"frame_{frameIndex:04d}.jpg")
    cv2.imwrite(frame_filename, frame)
    print(f"Saved annotated frame: {frame_filename}")

cv2.destroyAllWindows()