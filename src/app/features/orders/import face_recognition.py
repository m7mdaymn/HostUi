import cv2
import numpy as np
from tensorflow.keras.models import load_model

# Load pre-trained FaceNet model (Keras)
facenet_model = load_model("facenet_keras.h5")  # تحميل من الإنترنت

# Load OpenCV DNN face detector
protoPath = "deploy.prototxt"          # يمكن تحميله من opencv github
modelPath = "res10_300x300_ssd_iter_140000.caffemodel"
face_net = cv2.dnn.readNetFromCaffe(protoPath, modelPath)

# Function to extract face from image
def extract_face(img, conf_threshold=0.5):
    h, w = img.shape[:2]
    blob = cv2.dnn.blobFromImage(img, 1.0, (300,300), [104,117,123], False, False)
    face_net.setInput(blob)
    detections = face_net.forward()

    for i in range(0, detections.shape[2]):
        confidence = detections[0,0,i,2]
        if confidence > conf_threshold:
            box = detections[0,0,i,3:7] * np.array([w,h,w,h])
            (x1,y1,x2,y2) = box.astype(int)
            face = img[y1:y2, x1:x2]
            face = cv2.resize(face, (160,160))
            face = face.astype('float32')
            face = (face - 127.5) / 128.0
            return face
    return None

# Function to get embedding from FaceNet
def get_embedding(face_pixels):
    face_pixels = np.expand_dims(face_pixels, axis=0)
    embedding = facenet_model.predict(face_pixels)
    return embedding[0]

# Load known image
known_img = cv2.imread("mohamed.jpg")
known_face = extract_face(known_img)
known_embedding = get_embedding(known_face)

# Load test image
test_img = cv2.imread("test.jpg")
test_face = extract_face(test_img)
test_embedding = get_embedding(test_face)

# Compare embeddings
def is_same_person(embed1, embed2, threshold=0.5):
    dist = np.linalg.norm(embed1 - embed2)
    print("Distance:", dist)
    return dist < threshold

if is_same_person(known_embedding, test_embedding):
    print("Same person detected!")
else:
    print("Unknown person.")
