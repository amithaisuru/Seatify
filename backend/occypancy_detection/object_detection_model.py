import os

import cv2
import numpy as np
from cafeLayout import CafeLayout
from ultralytics import YOLO

# Create an output folder for annotated frames
# output_dir = 'annotated_frames/HOTWOK-1-A'
# os.makedirs(output_dir, exist_ok=True)

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

# IoU helper
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
    source=r'video1.mp4',
    tracker='bytetrack.yaml',
    classes=[0,56],
    persist=True,
    show=False,
    save=True,
    save_dir='outputs/',
    stream=True
)

cafe_layout = CafeLayout()

#process frames
for frameIndex, singleFrame in enumerate(stream): #enumerate(stream) gives (frame_idx, res) as soon as each frame is done
    frame = singleFrame.orig_img.copy() # copy of raw frame we annotate
    print(f"Frame {frameIndex}:")

    # Pull detections
    # Unpack the tracked detections in parallel arrays
    boxesXYXYs = singleFrame.boxes.xyxy.cpu().numpy() # bounding boxes (n×4)
    confs     = singleFrame.boxes.conf.cpu().numpy() # confidence scores (n) 
    cls_ids   = singleFrame.boxes.cls.cpu().numpy().astype(int) # class IDs (n)
    track_ids = singleFrame.boxes.id.cpu().numpy().astype(int) # track IDs (n)

    # Build a list of chairs this frame
    chair_boxes = []
    for (x1,y1,x2,y2), cls_id, track_id in zip(boxesXYXYs, cls_ids, track_ids):
        if singleFrame.names[cls_id] == 'chair':
            chairBoundingBox = list(map(int, (track_id, x1,y1,x2,y2)))
            chair_boxes.append(chairBoundingBox)
        
    # print(f"  → Found {len(chair_boxes)} chairs in this frame")
    # print(f"  → Found {len(boxesXYXYs)} total detections in this frame")

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
            p = pose_model(roi)[0]

            assigned_chair_id = None  # Initialize chair ID for this person
            # If keypoints were found, extracts the raw (n,17,3) array from p.keypoints.data.
            # In the shape tuple (n, 17, 3), that leading n is simply the number of person instances (i.e. detections) 
            # that the pose model found in your cropped image
            # Since you’re cropping around a single detected box, in most cases n will be 1
            if p.keypoints is not None:
                # Extract the raw (n,17,3) tensor of keypoints
                kpts_np = p.keypoints.data.cpu().numpy()  # shape (n,17,3)

                # Ensure we have at least 17 keypoints
                if kpts_np.ndim == 3 and kpts_np.shape[1] >= 17:
                    kpts = kpts_np[0]  # first person
                    # shape (17,3): [x,y,conf] per joint

                    # Compute the knee angle
                    kneeAngleResult = kneeAngleCondition(kpts)

                    # Compute the torso angle
                    torsoAngleResult = torsoAngleCondition(kpts)

                    # Compute the hip-knee level condition
                    hipKneeLevelResult = hipKneeLevelCondition(kpts, crop_height=(y2-y1))
                    
                    # # 4th test: does this person overlap any chair?
                    # iouSittingResult = any(
                    #     bbox_iou([x1,y1,x2,y2], cb) > IOU_THRESHOLD
                    #     for cb in chair_boxes
                    # )
                    
                    if kneeAngleResult or torsoAngleResult:
                        posture, color = 'sitting',  (0,255,0)
                        # Find the chair with highest IoU
                        max_iou = 0
                        for chair in chair_boxes:
                            chair_id, cx1, cy1, cx2, cy2 = chair
                            iou = bbox_iou([x1,y1,x2,y2], [cx1,cy1,cx2,cy2])
                            if iou > IOU_THRESHOLD and iou > max_iou:
                                max_iou = iou
                                assigned_chair_id = chair_id
                    else:
                        posture, color = 'standing', (0,0,255)
                    
            text = f"{posture} {conf:.2f} ID:{track_id}"

            #TODO: update layut here
            if assigned_chair_id is not None:
                cafe_layout.update_chair_occupancy(assigned_chair_id, occupied=True, person_id=track_id)
        else:
            # chair
            color = (255,0,0)
            text  = f"chair {conf:.2f} ID:{track_id}"

        # Draw & print
        # cv2.rectangle(frame, (x1,y1), (x2,y2), color, 2)
        # cv2.putText(frame, text, (x1, y1-10),
        #             cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)
        # print(f"  → {text}  box=[{x1},{y1},{x2},{y2}]")
    
    print(chair_boxes)
    cafe_layout.read_chair_list(chair_boxes)
    cafe_layout.show_graphical_layout()
    cv2.waitKey(0)
    cv2.destroyAllWindows()

        #need to wait here until opened windows is closed by user

    break