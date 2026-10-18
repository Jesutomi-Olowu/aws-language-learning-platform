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



window.onload = function () {
  const user = localStorage.getItem("languageBuddyUser");

  if (user) {
    const userData = JSON.parse(user);

    showChat(userData);

    loadMessages(userData.user_id);
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

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        username: username,
        password: password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      authMessage.textContent = data.detail || "Could not create account.";

      return;
    }

    authMessage.textContent = "Account created. You can now log in.";

    document.getElementById("signup-username").value = "";

    document.getElementById("signup-password").value = "";

    showLogin();
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

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        username: username,
        password: password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      authMessage.textContent = data.detail || "Invalid username or password.";

      return;
    }

    localStorage.setItem("languageBuddyUser", JSON.stringify(data));

    showChat(data);

    loadMessages(data.user_id);
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



async function loadMessages(userId) {
  try {
    const response = await fetch(`${API_URL}/messages/${userId}`);

    const data = await response.json();

    messages.innerHTML = "";

    data.messages.forEach(function (message) {
      addMessage(message.message, message.sender);
    });
  } catch (error) {
    console.error("Error loading messages:", error);
  }
}



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



async function saveMessage(userId, sender, message) {
  try {
    await fetch(`${API_URL}/messages`, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        user_id: userId,
        sender: sender,
        message: message,
      }),
    });
  } catch (error) {
    console.error("Error saving message:", error);
  }
}



async function sendMessage() {
  const message = messageInput.value.trim();

  if (!message) {
    return;
  }

  

  const user = JSON.parse(localStorage.getItem("languageBuddyUser"));

  if (!user) {
    return;
  }

 

  addMessage(message, "user");

  

  await saveMessage(user.user_id, "user", message);

  

  messageInput.value = "";

  

  sendButton.disabled = true;

  sendButton.textContent = "Thinking...";

  try {
    const response = await fetch(`${API_URL}/chat`, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        user_id: user.user_id,

        language: language.value,

        level: level.value,

        message: message,
      }),
    });

    const data = await response.json();

   

    if (data.reply) {
      addMessage(data.reply, "ai");

      

      await saveMessage(user.user_id, "ai", data.reply);
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



function logout() {
  localStorage.removeItem("languageBuddyUser");

  messages.innerHTML = "";

  chatSection.style.display = "none";

  authSection.style.display = "block";

  showLogin();
}
