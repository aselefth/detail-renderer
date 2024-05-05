import os
import random
import cv2 as cv
from ultralytics import YOLO
from tracker import Tracker
from typing import List

capture = cv.VideoCapture(0)
cv.namedWindow("result", cv.WINDOW_AUTOSIZE)
capture.set(3, 500)
capture.set(4, 500)

model = YOLO("yolov8n.pt")
tracker = Tracker()
colors = [(random.randint(30, 220), random.randint(30, 220),
          random.randint(30, 220)) for _ in range(10)]

while True:
    success, frame = capture.read()

    if success:
        results = model(frame)
        for res in results:
            detections: List[int] = []
            for r in res.boxes.data.tolist():
                x1, y1, x2, y2, score, class_id = r
                detections.append([int(x) for x in [x1, y1, x2, y2, score]])
        tracker.update(frame, detections)

        for track in tracker.tracks:
            bbox = track.bbox
            x1, y1, x2, y2 = bbox
            track_id = track.track_id

            cv.rectangle(frame, (int(x1), int(y1)), (int(x2), int(y2)),
                         (colors[track_id % len(colors)]), 3)

        cv.imshow("video", frame)
    if cv.waitKey(25) == 27:
        break

capture.release()
cv.destroyAllWindows()
