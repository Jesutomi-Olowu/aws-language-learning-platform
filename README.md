# Language Buddy 🌍

**Practise a new language through AI-powered conversations.**

Language Buddy is an AI-powered language practice web application that lets users practise conversations with an AI tutor. Users can choose a target language and proficiency level, send messages, and receive responses designed to support their learning.

The project started as a local web application and later expanded to explore AWS deployment, user accounts, and conversation storage.

## Features

- **Multiple languages:** Practise in 15 supported languages.
- **Adjustable difficulty:** Choose Beginner, Intermediate, or Advanced.
- **AI conversations:** Send messages and receive AI-generated replies.
- **Language corrections:** Get simple corrections for common mistakes.
- **Chat interface:** Practise through a straightforward, text-based interface.

## Supported Languages

Thai, English, Spanish, French, German, Italian, Portuguese, Japanese, Korean, Chinese, Arabic, Russian, Hindi, Indonesian, and Turkish.

## Screenshots

**Application interface**

![Language Buddy interface](https://github.com/user-attachments/assets/2779426d-09b8-478a-b6f8-90a17576e112)

**Example conversation**

![Language Buddy conversation](https://github.com/user-attachments/assets/0da7171a-2ab6-4143-9d17-15841c1939d8)

## Tech Stack

| Technology | Purpose |
|---|---|
| HTML, CSS, JavaScript | Frontend and user interaction |
| Python and FastAPI | Original local backend |
| Gemini API | AI-generated responses |
| AWS Amplify | Frontend hosting explored during later development |
| Amazon API Gateway and AWS Lambda | Cloud backend architecture explored |
| Amazon DynamoDB | Persistent storage explored during later development |

The AWS components represent the later development direction; their current deployment status should be verified.

## How It Works

### Original local architecture

```text
User
  ↓
Frontend (HTML, CSS, JavaScript)
  ↓
Python FastAPI Backend
  ↓
Gemini API
  ↓
Backend returns the response
  ↓
Frontend displays the reply
```

The backend communicates with Gemini so that the API key does not need to be exposed in frontend code.

### Later cloud architecture

```text
Frontend (AWS Amplify)
  ↓
Amazon API Gateway
  ↓
AWS Lambda
  ↓
Gemini API
```

DynamoDB was also explored for storing application data.

## Getting Started

### Prerequisites

- Python 3
- A Gemini API key
- The dependencies required by the current backend

### 1. Clone the repository

```bash
git clone YOUR_REPOSITORY_URL
cd language-buddy
```

Replace `YOUR_REPOSITORY_URL` with the actual GitHub repository URL.

### 2. Install backend dependencies

```bash
cd backend
pip install fastapi uvicorn google-genai
```

These are the dependencies documented for the original local version. Check the current backend code for the exact requirements.

### 3. Configure your API key

Set the `GEMINI_API_KEY` environment variable using your operating system's environment settings.

For Windows Command Prompt:

```bat
set GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

Replace the placeholder with your own key. **Never commit API keys or other secrets to GitHub.**

### 4. Start the backend

For a standard FastAPI application with an `app` object in `app.py`:

```bash
uvicorn app:app --reload
```

This command assumes the application object is named `app` and that you are running the command from the backend directory. Confirm the current code before relying on it.

### 5. Run the frontend

Open the `frontend` folder using a local development server. Ensure the frontend's API configuration points to the correct local backend endpoint.

## Project Structure

The original documented structure was:

```text
language-buddy/
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── backend/
│   └── app.py
└── README.md
```

Update this structure if the current repository contains additional files or folders.

## Project Status

The original local MVP was documented as working. Later development explored AWS deployment, authentication, and persistent conversation storage.

The current status of cloud deployment, account creation, and database persistence should be verified against the latest implementation.
