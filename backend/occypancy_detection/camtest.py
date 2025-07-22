import cv2

# Open default camera
cap = cv2.VideoCapture(0)

# Check if camera opened successfully
if not cap.isOpened():
    print("Error: Could not open webcam.")
    exit()

# Capture one frame
ret, frame = cap.read()

# If frame was captured successfully
if ret:
    # Optionally, display it
    cv2.imshow("Captured Frame", frame)
    cv2.waitKey(0)  # Wait for any key press
    cv2.destroyAllWindows()
    
    # Optionally, save the frame to disk
    # cv2.imwrite("captured_image.jpg", frame)
else:
    print("Failed to capture frame.")

# Release the camera
cap.release()
