from flask import Flask, request, jsonify
from flask_cors import CORS
from google import genai

app = Flask(__name__)

CORS(app)

# Gemini automatically uses GEMINI_API_KEY
client = genai.Client()


@app.route("/chat", methods=["POST"])
def chat():

    data = request.get_json()

    language = data.get("language")
    level = data.get("level")
    message = data.get("message")

    if not language or not level or not message:
        return jsonify({
            "error": "Language, level, and message are required."
        }), 400

    prompt = f"""
You are Language Buddy, an AI language practice partner.

The user is practicing: {language}
Their level is: {level}

The user said:
"{message}"

Your job:
1. If the user's message has an important or obvious mistake, briefly correct it.
2. Explain the correction simply.
3. Continue the conversation naturally.
4. Keep your response appropriate for a {level} learner.
5. Respond in English unless the user specifically asks you to use another language.
"""

    try:

        response = client.models.generate_content(
            model="gemini-3.8-flash",
            contents=prompt
        )

        return jsonify({
            "reply": response.text
        })

    except Exception as error:

        print("Gemini error:", error)

        return jsonify({
            "error": "Sorry, I couldn't get a response from the AI."
        }), 500


if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )