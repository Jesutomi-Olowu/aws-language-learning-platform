const language = document.getElementById("language");
const level = document.getElementById("level");
const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");
const messages = document.getElementById("messages");

function addMessage(text, type) {
  const message = document.createElement("div");

  message.classList.add("message");

  if (type === "user") {
    message.classList.add("user-message");
  } else {
    message.classList.add("ai-message");
  }

  message.textContent = text;

  messages.appendChild(message);

  messages.scrollTop = messages.scrollHeight;
}

async function sendMessage() {
  const message = messageInput.value.trim();

  if (!message) {
    return;
  }

  addMessage(message, "user");

  
  messageInput.value = "";

  
  sendButton.disabled = true;
  sendButton.textContent = "Thinking...";

  try {
    const response = await fetch("http://127.0.0.1:8000/chat", {
      method: "POST",
      headers: {
        "Content-Type": 
    "application/json",
      },

      body: JSON.stringify({
        language: language.value,
        level: level.value,
        message: message,
      }),
    });

    const data = await response.json();

    if (data.reply) {
      addMessage(data.reply, "ai");
    } else if (data.error) {
      addMessage(data.error, "ai");
    }
  } catch (error) {
    console.error("Error:", error);

    addMessage(
      "I couldn't connect to the AI. Make sure the Python server is running.",
      "ai",
    );
  } finally {
    sendButton.disabled = false;
    sendButton.textContent = "Send";
  }
}

sendButton.addEventListener("click", sendMessage);

messageInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    sendMessage();
  }
});
