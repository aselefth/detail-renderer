from ultralytics import YOLO
import cv2
import numpy as np
import os

print(os.getcwd())
model = YOLO("yolov8n.pt")
model.train(data='/home/andrey/projects/poopa/detail-renderer/objectTracking/train/config.yaml', epochs=40, batch=-1)
result = model.predict(
    source='/home/andrey/projects/poopa/detail-renderer/files/test/images', save=True, show=True)
cv2.waitKey(0)
