import os
import requests
from flask import Flask, render_template, request, jsonify
from werkzeug.utils import secure_filename

app = Flask(__name__)

# Imgur API configuration
IMGUR_CLIENT_ID = "YOUR_IMGUR_CLIENT_ID"
IMGUR_API_URL = "https://api.imgur.com/3/image"

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

    if image:
        filename = secure_filename(image.filename)
        headers = {"Authorization": f"Client-ID {IMGUR_CLIENT_ID}"}
        files = {"image": (filename, image, image.content_type)}

        try:
            response = requests.post(IMGUR_API_URL, headers=headers, files=files)
            response.raise_for_status()
            imgur_data = response.json()
            imgur_link = imgur_data["data"]["link"]
            return jsonify({"success": True, "link": imgur_link})
        except requests.exceptions.RequestException as e:
            return jsonify({"error": f"Failed to upload image: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
