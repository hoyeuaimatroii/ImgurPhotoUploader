import os
import requests
import logging
import time
from flask import Flask, render_template, request, jsonify
from werkzeug.utils import secure_filename

app = Flask(__name__)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Imgur API configuration
IMGUR_CLIENT_ID = os.environ.get("IMGUR_CLIENT_ID")
IMGUR_API_URL = "https://api.imgur.com/3/image"

# Retry configuration
MAX_RETRIES = 3
RETRY_DELAY = 1  # Initial delay in seconds

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/upload", methods=["POST"])
def upload_image():
    if "image" not in request.files:
        return jsonify({"error": "No image file provided"}), 400

    image = request.files["image"]
    if image.filename == "":
        return jsonify({"error": "No image selected"}), 400

    if image and IMGUR_CLIENT_ID:
        filename = secure_filename(image.filename)
        headers = {"Authorization": f"Client-ID {IMGUR_CLIENT_ID}"}
        files = {"image": (filename, image, image.content_type)}

        for attempt in range(MAX_RETRIES):
            try:
                response = requests.post(IMGUR_API_URL, headers=headers, files=files)
                response.raise_for_status()
                imgur_data = response.json()
                imgur_link = imgur_data["data"]["link"]
                return jsonify({"success": True, "link": imgur_link})
            except requests.exceptions.RequestException as e:
                logger.error(f"Attempt {attempt + 1} failed: {str(e)}")
                if response:
                    logger.error(f"Response content: {response.content}")
                if attempt < MAX_RETRIES - 1:
                    time.sleep(RETRY_DELAY * (2 ** attempt))  # Exponential backoff
                else:
                    return jsonify({"error": f"Failed to upload image after {MAX_RETRIES} attempts"}), 500
    else:
        if not IMGUR_CLIENT_ID:
            logger.error("IMGUR_CLIENT_ID is not set")
            return jsonify({"error": "Server configuration error"}), 500
        return jsonify({"error": "Invalid image file"}), 400

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
