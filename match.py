import cv2
import sys
import os
import json

def load_image_metadata(metadata_file="image_data.json"):
    with open(metadata_file, "r") as file:
        return json.load(file)

def match_image(uploaded_image_path, predefined_images_dir="images", accuracy_threshold=0.8):
    # Load image metadata
    image_metadata = load_image_metadata()
    
    uploaded_image = cv2.imread(uploaded_image_path)
    uploaded_image_gray = cv2.cvtColor(uploaded_image, cv2.COLOR_BGR2GRAY)
    target_size = (500, 500)
    uploaded_image_gray = cv2.resize(uploaded_image_gray, target_size)

    best_match = None
    best_score = float('-inf')

    for filename in os.listdir(predefined_images_dir):
        if filename.endswith('.jpg') or filename.endswith('.png'):
            predefined_image_path = os.path.join(predefined_images_dir, filename)
            predefined_image = cv2.imread(predefined_image_path)
            img_gray = cv2.cvtColor(predefined_image, cv2.COLOR_BGR2GRAY)
            img_gray = cv2.resize(img_gray, target_size)

            score = cv2.matchTemplate(uploaded_image_gray, img_gray, cv2.TM_CCOEFF_NORMED).max()

            if score > best_score:
                best_score = score
                best_match = filename

    if best_match:
        # Calculate match accuracy
        accuracy = best_score * 100
        is_accurate = accuracy >= (accuracy_threshold * 100)

        # Retrieve metadata for the best matching image
        metadata = image_metadata.get(best_match, {})
        result = {
            "Match Result": "Match Found" if is_accurate else "Low Confidence Match",
            "Match Score": f"{accuracy:.2f}%",
            "Accuracy": "High" if is_accurate else "Low",
            "Best Matching Image": best_match,
            **metadata  # Include metadata fields
        }
    else:
        result = {
            "Match Result": "No match found",
            "Match Score": "N/A",
            "Accuracy": "N/A",
            "Best Matching Image": "N/A"
        }

    print(json.dumps(result))  # JSON output for Node.js to parse

if __name__ == "__main__":
    uploaded_image_path = sys.argv[1]
    match_image(uploaded_image_path)
