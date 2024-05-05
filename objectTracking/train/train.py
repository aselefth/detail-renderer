from ultralytics import YOLO
import cv2 as cv
import numpy as np
import os

print(os.getcwd())
model = YOLO("yolov8n.pt")
model.train(data='/Users/andrejevstratov/projects/diploma/threlte/objectTracking/train/config.yaml', epochs=10, batch=9)
result = model.predict(
    source='/Users/andrejevstratov/projects/diploma/threlte/files/test/images', save=True)
