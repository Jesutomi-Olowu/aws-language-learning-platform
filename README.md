# Language Buddy 🌍

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

## How It Works

Language Buddy uses a frontend, a Python backend, and the Gemini API.

```text
User
  ↓
HTML / CSS / JavaScript
  ↓
Python Flask Backend
  ↓
Gemini API
  ↓
Python Flask Backend
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

The backend is built with Python and Flask.

It:

1. Receives the user's language, level, and message.
2. Creates instructions for the AI.
3. Sends the request to Gemini.
4. Receives the AI response.
5. Sends the response back to the frontend.

### Gemini

Gemini provides the AI capabilities of the application.

The Gemini API is accessed from the Python backend.

The API key is stored as an environment variable rather than inside the frontend code.

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
- Flask
- Flask-CORS
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
pip install flask flask-cors google-genai
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
http://127.0.0.1:5000
```

The `/` address may display a `Not Found` message because the application does not currently have a homepage route.

The frontend communicates with the `/chat` endpoint:

```text
http://127.0.0.1:5000/chat
```

## Running the Frontend

Open:

```text
frontend/index.html
```

in a web browser.

Select a language and learning level, type a message, and press **Send**.

The frontend sends the message to the Flask backend, which sends it to Gemini and returns the AI response.

## Example

### User

```text
Language: Thai
Level: Beginner

Message:
สวัสดี
```

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

The current version is an early MVP.

It currently does not include:

- User accounts
- Conversation history
- Database storage
- Voice input
- Pronunciation analysis
- Text-to-speech
- Authentication
- API Gateway
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

## Project Goal

The goal of Language Buddy is to create a simple and accessible way for people to practice languages through natural AI conversations.

The project also provides practical experience with:

- Frontend development
- Python
- Flask
- APIs
- AI integration
- Environment variables
- Backend development
- Cloud architecture concepts

## Status

**Current status: MVP working locally 🚀**

The application can successfully:

```text
User
  ↓
Frontend
  ↓
Flask
  ↓
Gemini
  ↓
Flask
  ↓
Frontend
```

The next stage is improving the AI behavior, testing the application, and eventually deploying the application to the cloud.
