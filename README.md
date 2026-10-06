# Language Buddy 

Language Buddy is an AI-powered language practice application that helps users practice conversations in different languages with an AI partner.

Users can choose a language and their learning level, send messages, and receive AI-generated responses. The application is designed to provide simple corrections when the user makes an obvious mistake while continuing the conversation naturally.

## Features

- Choose a language to practice
- Choose a learning level
  - Beginner
  - Intermediate
  - Advanced
- Send messages to the AI
- Receive AI-generated responses
- Receive simple corrections for obvious language mistakes
- Practice multiple languages
- Simple chat-based interface

## Supported Languages

The current application includes:

- Thai
- English
- Spanish
- French
- German
- Italian
- Portuguese
- Japanese
- Korean
- Chinese
- Arabic
- Russian
- Hindi
- Indonesian
- Turkish

  <img width="940" height="907" alt="image" src="https://github.com/user-attachments/assets/2779426d-09b8-478a-b6f8-90a17576e112" />


## How It Works

Language Buddy uses a frontend, a Python backend, and the Gemini API.

```text
User
  ↓
HTML / CSS / JavaScript
  ↓
Python FastAPI Backend
  ↓
Gemini API
  ↓
Python FastAPI Backend
  ↓
JavaScript
  ↓
AI Response
  ↓
User
```

### Frontend

The frontend is responsible for what the user sees and interacts with.

It contains:

- `index.html` for the application structure
- `style.css` for the design
- `script.js` for user interaction and communication with the backend

### Backend

The backend is built with Python and FastAPI.

It:

1. Receives the user's language, level, and message.
2. Creates instructions for the AI.
3. Sends the request to Gemini.
4. Receives the AI response.
5. Sends the response back to the frontend.

### Gemini

Gemini provides the AI capabilities of the application.
The Gemini API is accessed from the Python backend.
The API key is stored as an environment variable.
This prevents the API key from being exposed to users through the browser.

## Project Structure

```text
language-buddy/
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── backend/
│   └── app.py
│
└── README.md
```

## Requirements

Before running the application, make sure you have:

- Python 3 installed
- FastAPI
- UVicorn
- Google GenAI Python SDK
- A Gemini API key

## Installation

### 1. Clone or download the project

Open a terminal and navigate to the project folder.

```bash
cd language-buddy
```

### 2. Install the Python packages

Navigate to the backend folder:

```bash
cd backend
```

Install the required packages:

```bash
pip install fastapi uvicorn google-genai
```

## API Key Setup

The Gemini API key should be stored as an environment variable.

The application expects the variable to be called:

```text
GEMINI_API_KEY
```

### Windows

Create a user environment variable with:

**Variable name:**

```text
GEMINI_API_KEY
```

**Variable value:**

```text
MY_GEMINI_API_KEY
```

After creating the variable, open a new terminal.

You can check whether Windows can see the variable with:

```cmd
echo %GEMINI_API_KEY%
```

Do not share your API key publicly.

## Running the Backend

Navigate to the backend directory:

```bash
cd backend
```

Start the Flask server:

```bash
python app.py
```

The backend should run at:

```text
http://127.0.0.1:8000
```

The `/` address displayed a `Not Found` message because the application does not currently have a homepage route.

The frontend communicates with the `/chat` endpoint:

```text
http://127.0.0.1:8000/chat
```

## Running the Frontend

Open:

```text
http://127.0.0.1:5500/chat
```

in a web browser.

Select a language and learning level, type a message, and press **Send**.

<img width="940" height="907" alt="image" src="https://github.com/user-attachments/assets/a469399d-fe7d-47a2-9f9a-292b850a3aa7" />


The frontend sends the message to the Flask backend, which sends it to Gemini and returns the AI response.

## Example


<img width="1349" height="921" alt="Screenshot (478)" src="https://github.com/user-attachments/assets/0da7171a-2ab6-4143-9d17-15841c1939d8" />


<img width="927" height="918" alt="Screenshot (479)" src="https://github.com/user-attachments/assets/03fbd38e-c508-484f-9317-07d1f5a843d9" />

### AI

The AI may respond with a simple explanation and continue the conversation.

## Security

The Gemini API key should never be placed directly inside:

```text
index.html
script.js
```
The key is kept on the backend through the `GEMINI_API_KEY` environment variable.

The browser communicates with the Python backend rather than directly with Gemini.

```text
Browser
   ↓
Python Backend
   ↓
Gemini API
```

This prevents the API key from being exposed to the browser.

## Current Limitations

It currently does not include:

- User accounts
- Conversation history
- Database storage
- Voice input
- Pronunciation analysis
- Text-to-speech
- Authentication
- Production deployment
- Advanced progress tracking

These features can be added later as the application develops.

## Future Improvements

Possible future improvements include:

- Conversation history
- User accounts
- Learning progress tracking
- Vocabulary tracking
- Grammar explanations
- More detailed corrections
- Voice conversations
- Pronunciation feedback
- Text-to-speech
- Cloud deployment
- Database integration
- Production security improvements
- Deployment on AWS cloud services

## Project Goal

The goal of Language Buddy is to create a simple and accessible way for people to practice languages through natural AI conversations.

## Status

**Current status: MVP working locally **

The application can successfully:

```text
User
  ↓
Frontend
  ↓
FastAPI
  ↓
Gemini
  ↓
FastAPI
  ↓
Frontend
```

The next stage is improving the AI behavior, testing the application, and eventually deploying the application to the cloud.
