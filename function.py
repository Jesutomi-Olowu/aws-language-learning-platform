import json
import os
import time
import uuid
import urllib.request
import urllib.error

import boto3

TABLE_NAME = os.environ["TABLE_NAME"]
SECRET_ID = os.environ["SECRET_ID"]
REGION = os.environ.get("AWS_REGION", "us-east-1")
MODEL = os.environ.get("MODEL", "gemini-2.5-flash")
GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent"
MAX_HISTORY = int(os.environ.get("MAX_HISTORY", "20"))
CHAT_TTL_DAYS = int(os.environ.get("CHAT_TTL_DAYS", "90"))

dynamodb = boto3.resource("dynamodb", region_name=REGION)
table = dynamodb.Table(TABLE_NAME)
secrets = boto3.client("secretsmanager", region_name=REGION)

_gemini_key = None


def get_gemini_key() -> str:
    global _gemini_key
    if _gemini_key is None:
        _gemini_key = secrets.get_secret_value(SecretId=SECRET_ID)["SecretString"].strip()
    return _gemini_key


def system_instruction(language: str, level: str) -> str:
    return (
        f"You are Lingua, a warm, encouraging and very patient language tutor. "
        f"Your student is learning {language} at CEFR level {level}. "
        f"Always converse in {language}. If the student writes to you in another "
        f"language (for example asking what a word means), answer that question "
        f"briefly in the language they used, then continue in {language}. "
        f"Keep replies short — one to three sentences — like natural conversation. "
        f"Gently correct the student's mistakes by rephrasing correctly and "
        f"naturally within your reply, and briefly explain the correction in "
        f"{language} when it is useful. Ask follow-up questions to keep the "
        f"conversation going. Adapt your vocabulary and speed to level {level}. "
        f"Never use English (or any language other than {language}) in your "
        f"normal replies, whatever the student writes."
    )


def call_gemini(language: str, level: str, history: list, message: str) -> str:
    contents = [
        {"role": h["role"], "parts": [{"text": h["text"]}]}
        for h in history
    ]
    contents.append({"role": "user", "parts": [{"text": message}]})

    payload = {
        "system_instruction": {"parts": [{"text": system_instruction(language, level)}]},
        "contents": contents,
        "generationConfig": {"temperature": 0.7, "maxOutputTokens": 300},
    }
    req = urllib.request.Request(
        f"{GEMINI_URL}?key={get_gemini_key()}",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            body = json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        raise RuntimeError(f"Gemini HTTP {e.code}: {e.read().decode('utf-8', 'replace')[:300]}")
    return body["candidates"][0]["content"]["parts"][0]["text"].strip()


def load_history(student_id: str) -> list:
    resp = table.query(
        KeyConditionExpression="student_id = :sid AND begins_with(sk, :p)",
        ExpressionAttributeValues={":sid": student_id, ":p": "MSG#"},
        ScanIndexForward=False,          # newest first
        Limit=MAX_HISTORY,
    )
    items = list(reversed(resp.get("Items", [])))  # oldest -> newest
    return [{"role": i["role"], "text": i["text"]} for i in items]


def save_message(student_id: str, role: str, text: str) -> None:
    now = time.time()
    table.put_item(Item={
        "student_id": student_id,
        "sk": f"MSG#{now:.3f}#{uuid.uuid4().hex[:8]}",
        "role": role,
        "text": text,
        "created_at": int(now),
        "expires_at": int(now) + CHAT_TTL_DAYS * 86400,  # DynamoDB TTL
    })


def response(status: int, payload: dict) -> dict:
    return {
        "statusCode": status,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",   # tighten to your Amplify domain
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
        },
        "body": json.dumps(payload),
    }


def student_id_from(event: dict) -> str:
    claims = event.get("requestContext", {}).get("authorizer", {}).get("jwt", {}).get("claims", {})
    sub = claims.get("sub")
    if not sub:
        raise PermissionError("No authenticated user in request")
    return sub


def handler(event, context):
    method = event.get("requestContext", {}).get("http", {}).get("method", "")
    path = event.get("rawPath", "")

    if method == "OPTIONS":
        return response(200, {})

    try:
        student_id = student_id_from(event)

        if method == "GET" and path.endswith("/history"):
            return response(200, {"messages": load_history(student_id)})

        if method == "POST" and path.endswith("/chat"):
            body = json.loads(event.get("body") or "{}")
            language = str(body.get("language", "")).strip()[:60]
            level = str(body.get("level", "A1")).strip()[:5].upper()
            message = str(body.get("message", "")).strip()[:2000]
            if not language or not message:
                return response(400, {"error": "language and message are required"})
            if level not in ("A1", "A2", "B1", "B2", "C1", "C2"):
                level = "A1"

            history = load_history(student_id)
            reply = call_gemini(language, level, history, message)
            save_message(student_id, "user", message)
            save_message(student_id, "model", reply)
            return response(200, {"reply": reply})

        return response(404, {"error": "unknown route"})

    except PermissionError as e:
        return response(401, {"error": str(e)})
    except RuntimeError as e:
        return response(502, {"error": str(e)})
    except Exception as e:  
        print(f"Unhandled error: {e!r}")
        return response(500, {"error": "Something went wrong. Please try again."})