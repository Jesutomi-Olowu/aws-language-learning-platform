from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google import genai

app = FastAPI()

app.add_middleware(
    CORSMiddleware, 
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


client = genai.Client()

class ChatRequest(BaseModel):
    language:str
    level:str
    message:str
    
@app.post("/chat")
def chat(request: ChatRequest):

    prompt = f"""
You are Language Buddy, an AI language practice partner.

The user is practicing: {request.language}
Their level is: {request.level}

The user said:
"{request.message}"

Your job:
1. If the user's message has an important or obvious mistake, briefly correct it.
2. Explain the correction simply.
3. Continue the conversation naturally.
4. Keep your response appropriate for a {request.level} learner.
5. Respond in English unless the user specifically asks you to use another language.
"""

    try:

        response = client.models.generate_content(
            model="gemini-3.6-flash",
            contents=prompt
        )

        return {
            "reply": response.text
        }

    except Exception as error:

        print("Gemini error:", error)

        return {
            "error": "Sorry, I couldn't get a response from the AI."
        }
