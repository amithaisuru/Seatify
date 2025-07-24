import os

import cv2


def generate_video(folder_name):
    images = [img for img in os.listdir(folder_name) if img.endswith(".jpg")]
    #sort images according to name
    images.sort(key=lambda x: int(x.split("_")[1].split(".")[0]))
    frame = cv2.imread(os.path.join(folder_name, images[0]).replace("\\", "/"))
    height, width, layers = frame.shape
    fourcc = cv2.VideoWriter_fourcc(*'XVID')
    video = cv2.VideoWriter(f"{folder_name}.mp4", fourcc, 1, (width, height))

    for image in images:
        video.write(cv2.imread(os.path.join(folder_name, image).replace("\\", "/")))

    cv2.destroyAllWindows()
    video.release()

    return 0

if __name__ == "__main__":
    folder_name = "screenshots"  # Folder containing the images
    generate_video(folder_name)
    print(f"Video generated successfully from images in {folder_name}.mp4")