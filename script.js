const API_URL = "https://clmpn2u891.execute-api.us-east-1.amazonaws.com";

const authSection = document.getElementById("auth-section");
const chatSection = document.getElementById("chat-section");

const signupForm = document.getElementById("signup-form");
const loginForm = document.getElementById("login-form");

const authMessage = document.getElementById("auth-message");
const usernameDisplay = document.getElementById("username-display");

const language = document.getElementById("language");
const level = document.getElementById("level");
const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");
const messages = document.getElementById("messages");

function getUser() {
  try {
    return JSON.parse(localStorage.getItem("languageBuddyUser"));
  } catch {
    return null;
  }
}

async function readJson(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

function sessionExpired() {
  logout();
  authMessage.textContent = "Session expired. Please log in again.";
}


window.onload = function () {
  const user = getUser();

  if (user && user.token) {
    showChat(user);
    loadMessages();
  }
};


function showSignup() {
  signupForm.style.display = "block";
  loginForm.style.display = "none";
  authMessage.textContent = "";
}

function showLogin() {
  signupForm.style.display = "none";
  loginForm.style.display = "block";
  authMessage.textContent = "";
}

async function signup() {
  const username = document.getElementById("signup-username").value.trim();
  const password = document.getElementById("signup-password").value;

  if (!username || !password) {
    authMessage.textContent = "Please enter a username and password.";
    return;
  }

  try {
    const response = await fetch(`${API_URL}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: username, password: password }),
    });

    const data = await readJson(response);

    if (!response.ok) {
      authMessage.textContent =
        data.error || data.message || `Could not create account (${response.status}).`;
      return;
    }

    document.getElementById("signup-username").value = "";
    document.getElementById("signup-password").value = "";

    showLogin();
    authMessage.textContent = "Account created. You can now log in.";
  } catch (error) {
    console.error("Signup error:", error);
    authMessage.textContent = "Could not connect to the server.";
  }
}

async function login() {
  const username = document.getElementById("login-username").value.trim();
  const password = document.getElementById("login-password").value;

  if (!username || !password) {
    authMessage.textContent = "Please enter your username and password.";
    return;
  }

  try {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: username, password: password }),
    });

    const data = await readJson(response);

    if (!response.ok) {
      authMessage.textContent =
        data.error || data.message || `Login failed (${response.status}).`;
      return;
    }

    localStorage.setItem("languageBuddyUser", JSON.stringify(data));

    showChat(data);
    loadMessages();
  } catch (error) {
    console.error("Login error:", error);
    authMessage.textContent = "Could not connect to the server.";
  }
}

function showChat(user) {
  authSection.style.display = "none";
  chatSection.style.display = "block";
  usernameDisplay.textContent = user.username;
}


async function loadMessages() {
  const user = getUser();
  if (!user) return;

  try {
    const response = await fetch(`${API_URL}/messages`, {
      headers: { Authorization: `Bearer ${user.token}` },
    });

    if (response.status === 401) {
      sessionExpired();
      return;
    }

    const data = await readJson(response);

    messages.innerHTML = "";

    (data.messages || []).forEach(function (m) {
      addMessage(m.message, m.sender);
    });
  } catch (error) {
    console.error("Error loading messages:", error);
  }
}

function addMessage(text, type) {
  const message = document.createElement("div");

  message.classList.add("message");
  message.classList.add(type === "user" ? "user-message" : "ai-message");
  message.textContent = text;

  messages.appendChild(message);
  messages.scrollTop = messages.scrollHeight;
}

async function sendMessage() {
  const message = messageInput.value.trim();
  if (!message) return;

  const user = getUser();
  if (!user) return;

  addMessage(message, "user");
  messageInput.value = "";

  sendButton.disabled = true;
  sendButton.textContent = "Thinking...";

  try {
    const response = await fetch(`${API_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
      body: JSON.stringify({
        language: language.value,
        level: level.value,
        message: message,
      }),
    });

    if (response.status === 401) {
      sessionExpired();
      return;
    }

    const data = await readJson(response);

    addMessage(data.reply || data.error || "No response from the server.", "ai");
  } catch (error) {
    console.error("Error:", error);
    addMessage("I couldn't reach the server. Please try again.", "ai");
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

function logout() {
  localStorage.removeItem("languageBuddyUser");

  messages.innerHTML = "";
  chatSection.style.display = "none";
  authSection.style.display = "block";

  showLogin();
}
