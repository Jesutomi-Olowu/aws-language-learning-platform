
const API_URL = "https://clmpn2u891.execute-api.us-east-1.amazonaws.com";
const authSection = document.getElementById("auth-section");
const chatSection = document.getElementById("chat-section");

const signupForm = document.getElementById("signup-form-element");
const loginForm = document.getElementById("login-form-element");
const chatForm = document.getElementById("chat-form");

const authMessage = document.getElementById("auth-message");
const usernameDisplay = document.getElementById("username-display");
const chatStatus = document.getElementById("chat-status");

const language = document.getElementById("language");
const level = document.getElementById("level");
const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");
const messages = document.getElementById("messages");

const signupButton = document.getElementById("signup-button");
const loginButton = document.getElementById("login-button");
const logoutButton = document.getElementById("logout-button");

function getUser() {
    try {
        const user = JSON.parse(
            localStorage.getItem("languageBuddyUser")
        );

        return user && user.token ? user : null;
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

function getErrorMessage(data, status) {
    return data.error ||
        data.message ||
        `Request failed (${status}).`;
}


function showSignup() {
    document.getElementById("signup-form").style.display = "block";
    document.getElementById("login-form").style.display = "none";
    authMessage.textContent = "";
}

function showLogin() {
    document.getElementById("signup-form").style.display = "none";
    document.getElementById("login-form").style.display = "block";
    authMessage.textContent = "";
}


function showChat(user) {
    authSection.style.display = "none";
    chatSection.style.display = "block";
    usernameDisplay.textContent = user.username || "User";
    authMessage.textContent = "";
}

function logout() {
    localStorage.removeItem("languageBuddyUser");

    messages.replaceChildren();
    chatStatus.textContent = "";
    messageInput.value = "";

    chatSection.style.display = "none";
    authSection.style.display = "block";

    showLogin();
}

function sessionExpired() {
    logout();
    authMessage.textContent =
        "Your session has expired. Please log in again.";
}

function addMessage(text, type, messageId = null) {
    const message = document.createElement("div");

    message.classList.add(
        "message",
        type === "user" ? "user-message" : "ai-message"
    );

    const messageText = document.createElement("span");
    messageText.className = "message-text";
    messageText.textContent = text ?? "";

    message.appendChild(messageText);

    
    if (messageId !== null && messageId !== undefined) {
        const deleteButton = document.createElement("button");

        deleteButton.type = "button";
        deleteButton.className = "delete-message-button";
        deleteButton.textContent = "Delete";
        deleteButton.title = "Delete this message";
        deleteButton.setAttribute(
            "aria-label",
            "Delete this message"
        );

        deleteButton.addEventListener("click", () => {
            deleteMessage(messageId, message, deleteButton);
        });

        message.appendChild(deleteButton);
    }

    messages.appendChild(message);
    messages.scrollTop = messages.scrollHeight;
}

async function loadMessages() {
    const user = getUser();
    if (!user) return;

    chatStatus.textContent = "Loading messages...";

    try {
        const response = await fetch(`${API_URL}/messages`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${user.token}`
            }
        });

        if (response.status === 401) {
            sessionExpired();
            return;
        }

        const data = await readJson(response);

        if (!response.ok) {
            throw new Error(getErrorMessage(data, response.status));
        }

        messages.replaceChildren();

        const history = Array.isArray(data.messages)
            ? data.messages
            : [];

        history.forEach((item) => {
            addMessage(
                item.message,
                item.sender,
                item.message_id
            );
        });

        if (history.length === 0) {
            addMessage(
                "Hello! Choose a language and level, then send me a message to start practicing.",
                "ai"
            );
        }

        chatStatus.textContent = "";
    } catch (error) {
        console.error("Error loading messages:", error);
        chatStatus.textContent = "Could not load conversation history.";
    }
}

async function signup(event) {
    event.preventDefault();

    const username = document
        .getElementById("signup-username")
        .value.trim();

    const password = document
        .getElementById("signup-password")
        .value;

    if (!username || !password) {
        authMessage.textContent =
            "Please enter a username and password.";
        return;
    }

    signupButton.disabled = true;
    signupButton.textContent = "Creating account...";

    try {
        const response = await fetch(`${API_URL}/signup`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password })
        });

        const data = await readJson(response);

        if (!response.ok) {
            authMessage.textContent =
                getErrorMessage(data, response.status);
            return;
        }

        signupForm.reset();
        showLogin();

        authMessage.textContent =
            "Account created successfully. You can now log in.";
    } catch (error) {
        console.error("Signup error:", error);

        authMessage.textContent =
            "Could not connect to the server. Please try again.";
    } finally {
        signupButton.disabled = false;
        signupButton.textContent = "Create Account";
    }
}

async function login(event) {
    event.preventDefault();

    const username = document
        .getElementById("login-username")
        .value.trim();

    const password = document
        .getElementById("login-password")
        .value;

    if (!username || !password) {
        authMessage.textContent =
            "Please enter your username and password.";
        return;
    }

    loginButton.disabled = true;
    loginButton.textContent = "Logging in...";

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password })
        });

        const data = await readJson(response);

        if (!response.ok) {
            authMessage.textContent =
                getErrorMessage(data, response.status);
            return;
        }

        if (!data.token) {
            authMessage.textContent =
                "Login response did not contain an authentication token.";
            console.error("Unexpected login response:", data);
            return;
        }

        localStorage.setItem(
            "languageBuddyUser",
            JSON.stringify(data)
        );

        loginForm.reset();
        showChat(data);

        await loadMessages();
    } catch (error) {
        console.error("Login error:", error);

        authMessage.textContent =
            "Could not connect to the server. Please try again.";
    } finally {
        loginButton.disabled = false;
        loginButton.textContent = "Login";
    }
}

async function sendMessage(event) {
    event.preventDefault();

    const text = messageInput.value.trim();
    if (!text) return;

    const user = getUser();

    if (!user) {
        sessionExpired();
        return;
    }

    messageInput.value = "";
    messageInput.disabled = true;
    sendButton.disabled = true;
    sendButton.textContent = "Thinking...";

    
    addMessage(text, "user");

    try {
        const response = await fetch(`${API_URL}/chat`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${user.token}`
            },
            body: JSON.stringify({
                language: language.value,
                level: level.value,
                message: text
            })
        });

        if (response.status === 401) {
            sessionExpired();
            return;
        }

        const data = await readJson(response);

        if (!response.ok) {
            addMessage(
                getErrorMessage(data, response.status),
                "ai"
            );
            return;
        }

        if (data.reply) {
            
            await loadMessages();
        } else {
            addMessage(
                data.error || "The AI returned an empty response.",
                "ai"
            );
        }
    } catch (error) {
        console.error("Chat error:", error);

        addMessage(
            "I couldn't reach the server. Please try again.",
            "ai"
        );
    } finally {
        messageInput.disabled = false;
        sendButton.disabled = false;
        sendButton.textContent = "Send";
        messageInput.focus();
    }
}


async function deleteMessage(messageId, messageElement, button) {
    const user = getUser();
    if (!user) {
        sessionExpired();
        return;
    }

    if (!confirm("Permanently delete this message?")) {
        return;
    }

    button.disabled = true;
    button.textContent = "Deleting...";

    try {
        const response = await fetch(
            `${API_URL}/messages/${encodeURIComponent(messageId)}`,
            {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            }
        );

        if (response.status === 401) {
            sessionExpired();
            return;
        }

        const data = await readJson(response);

        if (!response.ok) {
            alert(getErrorMessage(data, response.status));
            return;
        }

        messageElement.remove();
    } catch (error) {
        console.error("Delete message error:", error);
        alert("Could not connect to the server. The message was not removed.");
    } finally {
        if (button.isConnected) {
            button.disabled = false;
            button.textContent = "Delete";
        }
    }
}

document
    .getElementById("show-login-button")
    .addEventListener("click", showLogin);

document
    .getElementById("show-signup-button")
    .addEventListener("click", showSignup);

signupForm.addEventListener("submit", signup);
loginForm.addEventListener("submit", login);
chatForm.addEventListener("submit", sendMessage);

logoutButton.addEventListener("click", () => {
    if (confirm("Are you sure you want to log out?")) {
        logout();
    }
});

async function initializeApp() {
    const user = getUser();

    if (user) {
        showChat(user);
        await loadMessages();
    } else {
        authSection.style.display = "block";
        chatSection.style.display = "none";
        showLogin();
    }
}

initializeApp();
