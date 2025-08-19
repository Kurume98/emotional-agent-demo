from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route("/api/chat", methods=["POST"])
def chat():
    try:
        request_data = request.get_json()
        print("Request JSON:", request_data)  # Debug log in terminal

        if not request_data:
            return jsonify({"error": "No JSON received"}), 400

        # safely get message
        message = request_data.get("message", "")

        if not message.strip():
            return jsonify({"error": "Message field is empty"}), 400

        # demo emotional response logic
        if "sad" in message.lower():
            reply = "I hear sadness in your tone. I’m here with you."
        elif "happy" in message.lower():
            reply = "That’s wonderful! I can feel your joy."
        else:
            reply = f"You said: {message}"

        return jsonify({"reply": reply})

    except Exception as e:
        print("Error in /api/chat:", str(e))
        return jsonify({"error": "Server error", "details": str(e)}), 500


import os

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
