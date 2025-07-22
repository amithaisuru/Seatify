import os
import time

import cv2
import numpy as np
from cafeLayout import CafeLayout
from ultralytics import YOLO

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

# General angle scoring function
def score_within_range(value, lower_bound, upper_bound):
    """
    Returns a normalized score between 0 and 1 depending on how close
    the value is within the [lower_bound, upper_bound] range.
    """
    if value <= lower_bound:
        return 1.0
    elif value >= upper_bound:
        return 0.0
    else:
        return (value - lower_bound) / (upper_bound - lower_bound)

# compute knee angle
def kneeAngleCondition(kpts):
    try:
        # compute left & right knee angles
        l_ang = calculate_angle(kpts[11,:2], kpts[13,:2], kpts[15,:2]) #computes left knee angles
        r_ang = calculate_angle(kpts[12,:2], kpts[14,:2], kpts[16,:2]) #computes right knee angles
        # compute average angle
        knee_angle = (l_ang + r_ang) / 2
        return score_within_range(knee_angle, 70, 120)  # Normalized score between 0 and 1
    except:
        return 0.0  

#Compute torso lean: angle at the hip by shoulder→hip→knee
def torsoAngleCondition(kpts):
    try:
        left_torso  = calculate_angle(kpts[5,:2],  kpts[11,:2], kpts[13,:2])  # L-shoulder, L-hip, L-knee
        right_torso = calculate_angle(kpts[6,:2],  kpts[12,:2], kpts[14,:2])  # R-shoulder, R-hip, R-knee
        torso_angle = (left_torso + right_torso) / 2

        return score_within_range(torso_angle, 60, 120)

    except:
        return 0.0  

#Hip‐knee level test: True if avg vertical distance between hip & knee is < 15% of crop height
def hipKneeLevelCondition(kpts, crop_height):
    max_ratio = 0.15  # Maximum allowed ratio of hip-knee distance to crop height
    try:
        dy_left  = abs(kpts[11,1] - kpts[13,1])
        dy_right = abs(kpts[12,1] - kpts[14,1])
        avg_dy   = (dy_left + dy_right) / 2
        ratio = avg_dy / crop_height
        score = 1.0 - min(ratio / max_ratio, 1.0)
        return score
    except:
        return 0.0

def is_sitting(knee_angle, torso_angle, hip_knee_level):
    """
    Determine if a person is sitting based on the conditions.
    weightd average of the conditions to determine sitting posture.
    """
    # Define weights for each condition
    knee_weight = 0.4
    torso_weight = 0.4
    hip_knee_weight = 0.2

    # Calculate the weighted average
    score = (knee_angle * knee_weight + torso_angle * torso_weight + hip_knee_level * hip_knee_weight)

    # Threshold to decide sitting vs standing
    return score > 0.364  # Adjust threshold as needed

def get_next_frame(after_n_mins, cap):
    """
    Get the next frame after skipping a specified number of minutes.
    """
    fps = cap.get(cv2.CAP_PROP_FPS)
    frame_count = int(fps * 60 * after_n_mins)
    for _ in range(frame_count):
        ret, frame = cap.read()
        if not ret:
            return None
    #sleep for n mins
    print("sleeping...")
    time.sleep(after_n_mins * 60)
    print("returning frame no: ", cap.get(cv2.CAP_PROP_POS_FRAMES))
    return ret, frame

cap = cv2.VideoCapture(r'HOTWOK -2-A.mp4')
frameIndex = 0

while cap.isOpened():
    ret, frame = get_next_frame(0.1, cap)  # Get the next frame after 1 minute
    if not ret:
        break
    result = det_model.track(
        source=frame,
        tracker='bytetrack.yaml',
        classes=[0,56,60],
        persist=True,
        stream=False,
        verbose=False
    )[0]  # get the first (and only) result

    cafe_layout = CafeLayout()
    frame_copy = frame.copy()
    print(f"Frame_amitha {frameIndex}:")

    # Pull detections
    boxesXYXYs = result.boxes.xyxy.cpu().numpy()
    confs = result.boxes.conf.cpu().numpy()
    cls_ids = result.boxes.cls.cpu().numpy().astype(int)
    track_ids = result.boxes.id.cpu().numpy().astype(int)

    # Build a list of chairs and tables
    chair_boxes = []
    table_boxes = []
    for (x1, y1, x2, y2), cls_id, track_id in zip(boxesXYXYs, cls_ids, track_ids):
        label = result.names[cls_id]
        if label == 'chair':
            chair_boxes.append(list(map(int, (track_id, x1, y1, x2, y2))))
        elif label == 'dining table':
            table_boxes.append(list(map(int, (track_id, x1, y1, x2, y2))))

    # Process each detection
    for (x1, y1, x2, y2), conf, cls_id, track_id in zip(boxesXYXYs, confs, cls_ids, track_ids):
        x1, y1, x2, y2 = map(int, (x1, y1, x2, y2))
        label = result.names[cls_id]
        
        if label == 'person':
            print("person detected")
            posture, color = 'unknown', (0, 255, 255)
            roi = frame[y1:y2, x1:x2]
            p = pose_model(roi)[0]
            if p.keypoints is not None:
                kpts_np = p.keypoints.data.cpu().numpy()
                if kpts_np.ndim == 3 and kpts_np.shape[0] > 0 and kpts_np.shape[1] >= 17:
                    kpts = kpts_np[0]
                    kneeAngleResult = kneeAngleCondition(kpts)
                    torsoAngleResult = torsoAngleCondition(kpts)
                    hipKneeLevelResult = hipKneeLevelCondition(kpts, crop_height=(y2 - y1))
                    if is_sitting(kneeAngleResult, torsoAngleResult, hipKneeLevelResult):
                        posture, color = 'sitting', (0, 255, 0)
                        print("Person is sitting")
                    else:
                        posture, color = 'standing', (0, 0, 255)
                        print("Person is standing")
            text = f"{posture} {conf:.2f} ID:{track_id}"
            cafe_layout.add_person(track_id, (x1, y1), (x2, y2), posture)

    # Draw annotations
    for people in cafe_layout.people:
        x1, y1 = people.top_left
        x2, y2 = people.bottom_right
        color1 = (0, 255, 0) if people.is_sitting else (0, 0, 255)
        text = f"{people.is_sitting} ID:{people.id}"
        cv2.rectangle(frame_copy, (x1, y1), (x2, y2), color1, 2)
        cv2.putText(frame_copy, text, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color1, 2)

    annotated_frame_path = os.path.join('annotated_frames_4', f'frame_{frameIndex}.jpg')
    cv2.imwrite(annotated_frame_path, frame_copy)

    cafe_layout.read_chair_list(chair_boxes)
    print(len(chair_boxes), "chairs detected in this frame")
    cafe_layout.read_table_list(table_boxes)
    print(len(table_boxes), "tables detected in this frame")
    cafe_layout.map_chairs_to_tables_by_distance()
    cafe_layout.map_people_to_tables_by_distance()
    cafe_layout.analyze_occupancy()
    cafe_layout.update_databse()

    frameIndex += 1

cap.release()