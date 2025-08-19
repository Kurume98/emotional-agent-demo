import os
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

app = Flask(__name__, static_folder='../frontend/build', static_url_path='')
CORS(app)

@app.route("/api/chat", methods=["POST"])
def chat():
    try:
        request_data = request.get_json()
        print("Request JSON:", request_data)  # Debug log in terminal

        if not request_data:
            return jsonify({"error": "No JSON received"}), 400

        # safely get message - handle both formats
        message = request_data.get("message", "") or request_data.get("text", "")

        if not message.strip():
            return jsonify({"error": "Message field is empty"}), 400

        # Enhanced emotional response logic for age-tech
        message_lower = message.lower()
        
        # Age-tech specific responses
        if any(word in message_lower for word in ["lonely", "isolated", "alone", "miss", "passed away"]):
            reply = "I hear the weight of loss and loneliness in your words. These feelings are so real, and you're not alone in experiencing them. Many people in our community share similar experiences. Would you like to talk more about what you're feeling?"
        
        elif any(word in message_lower for word in ["memory", "forget", "confused", "can't remember"]):
            reply = "Memory changes can be really concerning. It's completely understandable to feel anxious about this. These experiences are more common than you might think, and there are many strategies and support systems available. You're being very brave by sharing this."
        
        elif any(word in message_lower for word in ["independence", "driving", "license", "freedom"]):
            reply = "Losing independence, especially something as fundamental as driving, is incredibly difficult. This represents so much more than transportation - it's about autonomy and identity. Your feelings about this are completely valid."
        
        elif any(word in message_lower for word in ["burden", "family", "children", "worry"]):
            reply = "The fear of being a burden is something so many people share, but let me tell you something important: your family loves you and wants to support you, just as you've supported them throughout your life. This isn't burden - this is love."
        
        elif any(word in message_lower for word in ["retirement home", "assisted living", "move"]):
            reply = "Decisions about living arrangements are among the most difficult anyone faces. This isn't just about a place to live - it's about your entire life and identity. Take your time with this decision, and remember that your feelings matter most."
        
        elif any(word in message_lower for word in ["aging", "getting old", "time running out"]):
            reply = "These are such profound and universal feelings. Every emotion you're experiencing is completely valid. Your life experience and wisdom are incredible gifts, and every day you have is precious and meaningful."
        
        elif any(word in message_lower for word in ["technology", "phone", "computer", "confusing"]):
            reply = "Technology can feel overwhelming, especially when it changes so quickly. But your willingness to learn and adapt is remarkable. You're not alone in this - many people share these frustrations, and there are wonderful resources to help."
        
        elif any(word in message_lower for word in ["friends gone", "last one", "survived"]):
            reply = "Being the last one remaining is such a profound and lonely experience. The grief of outliving friends and loved ones is real and heavy. Your memories and stories are precious treasures that keep their spirits alive."
        
        elif any(word in message_lower for word in ["proud", "still active", "exercise", "walk"]):
            reply = "Your pride in staying active is so inspiring! Every step you take is a testament to your resilience and determination. You are showing everyone what aging with dignity and strength looks like."
        
        else:
            # Default emotional response
            if "sad" in message_lower:
                reply = "I hear sadness in your tone. I'm here with you, and your feelings are completely valid."
            elif "happy" in message_lower:
                reply = "That's wonderful! I can feel your joy and it's truly uplifting."
            elif "angry" in message_lower or "frustrated" in message_lower:
                reply = "I can sense your frustration, and it's completely understandable. These feelings are valid and important."
            elif "worried" in message_lower or "scared" in message_lower:
                reply = "Worry and fear are such natural responses to the challenges you're facing. You're not alone in these feelings."
            else:
                reply = f"I hear you saying: {message}. Your experiences and feelings matter deeply."
        
        return jsonify({"reply": reply})

    except Exception as e:
        print("Error in /api/chat:", str(e))
        return jsonify({"error": "Server error", "details": str(e)}), 500


@app.route("/api/unified-chat", methods=["POST"])
def unified_chat():
    try:
        request_data = request.get_json()
        print("Unified Request JSON:", request_data)

        if not request_data:
            return jsonify({"error": "No JSON received"}), 400

        message = request_data.get("message", "") or request_data.get("text", "")
        voice_emotion = request_data.get("voiceEmotion", None)
        current_mood = request_data.get("currentMood", "neutral")

        message_lower = message.lower()

        # Enhanced unified emotional response
        if voice_emotion and voice_emotion != "none":
            if voice_emotion.lower() in ["excited", "happy"]:
                reply = f"I can truly sense your {voice_emotion} through your voice! Your energy is beautiful and contagious."
            elif voice_emotion.lower() in ["sad", "angry"]:
                reply = f"I hear the {voice_emotion} in your voice. Your feelings are completely valid and I'm here to listen."
            else:
                reply = f"I detect {voice_emotion} in your voice. Your emotions are being heard and understood deeply."
        else:
            # Text-based emotional analysis
            if "sad" in message_lower:
                reply = "I hear sadness in your words. You're not alone in these feelings - I'm here with you."
            elif "happy" in message_lower:
                reply = "I can feel your joy! Your happiness is truly uplifting and beautiful."
            elif "angry" in message_lower:
                reply = "I understand your frustration. These feelings are completely valid and important."
            elif "calm" in message_lower:
                reply = "I sense your calmness. Your peace is appreciated and creates a beautiful space."
            else:
                reply = f"I hear you saying: {message}. Your experiences and feelings matter deeply to me."

        return jsonify({
            "reply": reply,
            "mood": voice_emotion or "neutral",
            "intensity": 0.7 if voice_emotion else 0.5,
            "voiceData": voice_emotion,
            "emotionalArc": [
                {
                    "timestamp": "2024-01-01T00:00:00Z",
                    "mood": voice_emotion or "neutral",
                    "intensity": 0.7 if voice_emotion else 0.5,
                    "trigger": "user_input"
                }
            ]
        })

    except Exception as e:
        print("Error in /api/unified-chat:", str(e))
        return jsonify({"error": "Server error", "details": str(e)}), 500


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    static_folder_path = app.static_folder or '../frontend/build'
    if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    else:
        return send_from_directory(static_folder_path, 'index.html')


import os

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
