from ultralytics import YOLO
import cv2
import numpy as np
import os

print(os.getcwd())
model = YOLO("/home/andrey/projects/poopa/detail-renderer/runs/detect/train3/weights/best.pt")
# model.train(data='/home/andrey/projects/poopa/detail-renderer/objectTracking/train/config.yaml', epochs=22, batch=16)
result = model.predict(
    source='/home/andrey/projects/poopa/detail-renderer/files/test/images', save=True, show=True)
cv2.waitKey(0)
