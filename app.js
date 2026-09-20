const CONFIG = {
  API: "/api",
  COGNITO_DOMAIN: "your-auth-domain.auth.us-east-1.amazoncognito.com",        
  CLIENT_ID: "your-cognito-client-id",
  REDIRECT_URI: window.location.origin + window.location.pathname,
};


const LANGUAGES = {
  "Spanish": "es-ES", "French": "fr-FR", "German": "de-DE",
  "Italian": "it-IT", "Portuguese": "pt-PT", "Dutch": "nl-NL",
  "Swedish": "sv-SE", "Polish": "pl-PL", "Japanese": "ja-JP",
  "Korean": "ko-KR", "Mandarin": "zh-CN", "Cantonese": "zh-HK",
  "Arabic": "ar-SA", "Hindi": "hi-IN", "Russian": "ru-RU",
  "Turkish": "tr-TR", "Vietnamese": "vi-VN", "Thai": "th-TH",
  "Greek": "el-GR", "Hebrew": "he-IL", "Indonesian": "id-ID",
  "Ukrainian": "uk-UA", "Finnish": "fi-FI", "Danish": "da-DK",
  "Norwegian": "nb-NO", "Czech": "cs-CZ", "Romanian": "ro-RO",
};

const ICON_LISTEN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/></svg>';

const $ = (id) => document.getElementById(id);
let idToken = sessionStorage.getItem("id_token");
let autoSpeak = localStorage.getItem("lingua_autospeak") !== "off";

function loginUrl() {
  const p = new URLSearchParams({
    client_id: CONFIG.CLIENT_ID,
    response_type: "token",
    scope: "openid",
    redirect_uri: CONFIG.REDIRECT_URI,
  });
  return `https://${CONFIG.COGNITO_DOMAIN}/login?${p}`;
}

function handleAuthReturn() {
  if (location.hash.includes("id_token")) {
    const params = new URLSearchParams(location.hash.slice(1));
    idToken = params.get("id_token");
    sessionStorage.setItem("id_token", idToken);
    history.replaceState(null, "", location.pathname); // clean the URL
  }
}

function logout() {
  sessionStorage.removeItem("id_token");
  location.href = `https://${CONFIG.COGNITO_DOMAIN}/logout?client_id=${CONFIG.CLIENT_ID}&logout_uri=${CONFIG.REDIRECT_URI}`;
}



async function api(path, options = {}) {
  const resp = await fetch(CONFIG.API + path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: idToken,
      ...(options.headers || {}),
    },
  });
  if (resp.status === 401) { sessionStorage.removeItem("id_token"); location.reload(); }
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) throw new Error(data.error || `HTTP ${resp.status}`);
  return data;
}



function speak(text, langTag) {
  const u = new SpeechSynthesisUtterance(text);
  const tag = langTag || LANGUAGES[$("language").value];
  u.lang = tag;
  const voice = speechSynthesis.getVoices().find(v => v.lang.startsWith(tag.slice(0, 2)));
  if (voice) u.voice = voice;
  speechSynthesis.cancel();
  speechSynthesis.speak(u);
}

function setupMic() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const micBtn = $("mic");
  if (!SR) { micBtn.disabled = true; micBtn.title = "Speech recognition not supported in this browser"; return; }
  let rec;
  micBtn.onclick = () => {
    if (rec && micBtn.classList.contains("listening")) { rec.stop(); return; }
    rec = new SR();
    rec.lang = LANGUAGES[$("language").value];
    rec.interimResults = false;
    micBtn.classList.add("listening");
    $("status").textContent = "Listening…";
    rec.onresult = (e) => { $("input").value = e.results[0][0].transcript; autoGrow(); };
    rec.onend = () => { micBtn.classList.remove("listening"); $("status").textContent = ""; };
    rec.onerror = () => {
      micBtn.classList.remove("listening");
      $("status").textContent = "Microphone error — check browser permission.";
    };
    rec.start();
  };
}



function scrollDown() { $("chat").scrollTop = $("chat").scrollHeight; }

function hideEmpty() {
  const empty = $("empty");
  if (empty) empty.remove();
}

function addMessage(role, text) {
  hideEmpty();
  const div = document.createElement("div");
  div.className = "msg " + (role === "user" ? "user" : "bot");
  div.textContent = text;
  if (role !== "user") {
    const say = document.createElement("button");
    say.className = "say";
    say.innerHTML = ICON_LISTEN + "<span>Listen</span>";
    say.onclick = () => speak(text, LANGUAGES[$("language").value]);
    div.appendChild(say);
  }
  $("chat").appendChild(div);
  scrollDown();
}

function addTyping() {
  hideEmpty();
  const div = document.createElement("div");
  div.className = "msg bot typing";
  div.id = "typing";
  div.innerHTML = "<span></span><span></span><span></span>";
  $("chat").appendChild(div);
  scrollDown();
}

function removeTyping() {
  const t = $("typing");
  if (t) t.remove();
}

function autoGrow() {
  const el = $("input");
  el.style.height = "auto";
  el.style.height = Math.min(el.scrollHeight, 120) + "px";
}

async function send(preset) {
  const text = (preset || $("input").value).trim();
  if (!text) return;
  $("input").value = "";
  autoGrow();
  addMessage("user", text);
  addTyping();
  try {
    const { reply } = await api("/chat", {
      method: "POST",
      body: JSON.stringify({
        language: $("language").value,
        level: $("level").value,
        message: text,
      }),
    });
    removeTyping();
    addMessage("model", reply);
    if (autoSpeak) speak(reply);
  } catch (e) {
    removeTyping();
    $("status").textContent = "Error: " + e.message;
  }
}

async function loadHistory() {
  try {
    const { messages } = await api("/history");
    messages.forEach(m => addMessage(m.role, m.text));
  } catch { }
}


function persistControls() {
  localStorage.setItem("lingua_language", $("language").value);
  localStorage.setItem("lingua_level", $("level").value);
}

function restoreControls() {
  const lang = localStorage.getItem("lingua_language");
  const level = localStorage.getItem("lingua_level");
  if (lang && LANGUAGES[lang]) $("language").value = lang;
  if (level) $("level").value = level;
  $("autoSpeak").classList.toggle("on", autoSpeak);
  $("autoSpeak").setAttribute("aria-pressed", autoSpeak);
}



handleAuthReturn();
if (!idToken) {
  $("login").style.display = "block";
  $("loginLink").href = loginUrl();
} else {
  $("app").style.display = "block";
  $("logoutBtn").style.display = "inline-block";
  $("who").textContent = "Signed in";

  const sel = $("language");
  for (const name of Object.keys(LANGUAGES)) {
    const o = document.createElement("option");
    o.value = o.textContent = name;
    sel.appendChild(o);
  }
  restoreControls();

  $("send").onclick = () => send();
  $("logoutBtn").onclick = logout;
  $("language").onchange = persistControls;
  $("level").onchange = persistControls;
  $("autoSpeak").onclick = () => {
    autoSpeak = !autoSpeak;
    localStorage.setItem("lingua_autospeak", autoSpeak ? "on" : "off");
    restoreControls();
  };
  document.querySelectorAll(".chips button").forEach(b => {
    b.onclick = () => send(b.dataset.prompt);
  });
  $("input").addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  });
  $("input").addEventListener("input", autoGrow);
  setupMic();
  speechSynthesis.onvoiceschanged = () => {};
  loadHistory();
}
