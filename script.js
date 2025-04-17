// =============================
// PeopleChat - script.js
// =============================

// === Global Variables ===
let currentUser = localStorage.getItem("currentUser") || null;
const users = JSON.parse(localStorage.getItem("users") || "{}");
const messages = JSON.parse(localStorage.getItem("messages") || "{}");
const badges = JSON.parse(localStorage.getItem("badges") || "{}");

// === Page Load Logic ===
window.onload = function () {
  const path = window.location.pathname;

  if (path.includes("home.html")) {
    if (!currentUser) {
      window.location.href = "index.html";
      return;
    }
    document.getElementById("welcomeUser").innerText = "Welcome, " + currentUser;
    showUsers();
  }

  if (path.includes("profile.html")) {
    if (!currentUser) {
      window.location.href = "index.html";
      return;
    }
    showProfile();
  }

  if (path.includes("chat.html")) {
    if (!currentUser) {
      window.location.href = "index.html";
      return;
    }
    showChat();
    startChatUpdate();
  }
};

// === Signup Function ===
function signup() {
  const user = document.getElementById("username").value;
  const pass = document.getElementById("password").value;

  if (!user || !pass) {
    alert("Please enter both a username and password.");
    return;
  }

  if (users[user]) {
    alert("Username already exists.");
    return;
  }

  users[user] = { password: pass };
  localStorage.setItem("users", JSON.stringify(users));
  alert("Signed up! You can now log in.");
}

// === Login Function ===
function login() {
  const user = document.getElementById("username").value;
  const pass = document.getElementById("password").value;

  if (!user || !pass) {
    alert("Please enter both a username and password.");
    return;
  }

  if (!users[user] || users[user].password !== pass) {
    alert("Invalid credentials.");
    return;
  }

  localStorage.setItem("currentUser", user);
  window.location.href = "home.html";
}

// === Logout Function ===
function logout() {
  localStorage.removeItem("currentUser");
  window.location.href = "index.html";
}

// === Show All Users (Home Page) ===
function showUsers() {
  const list = document.getElementById("userList");
  list.innerHTML = '';

  for (let user in users) {
    if (user === currentUser) continue; // Prevent self-chat

    const badge = badges[user] || '';
    const div = document.createElement("div");
    div.innerHTML = `
      <strong>${user}</strong><br>
      <span style="font-size: 12px; color: gray;">${badge}</span><br>
      <button onclick="chatWith('${user}')">Chat</button>
      <hr>
    `;
    list.appendChild(div);
  }
}

// === Chat With User ===
function chatWith(user) {
  if (user === currentUser) { // Prevent messaging yourself
    alert("You can't message yourself!");
    return;
  }

  localStorage.setItem("currentChat", user);
  window.location.href = "chat.html";
}

// === Show Chat ===
function showChat() {
  const chatWith = localStorage.getItem("currentChat");
  if (!chatWith) {
    alert("No user selected.");
    window.location.href = "home.html";
    return;
  }

  document.getElementById("chatWithUser").innerText = chatWith;

  const chatBox = document.getElementById("chatBox");
  chatBox.innerHTML = '';

  const chatHistory = messages[chatWith] || [];

  // Sort messages by time
  const sorted = [...chatHistory].sort((a, b) => (a.time || 0) - (b.time || 0));

  sorted.forEach(msg => {
    const badge = badges[msg.from] || '';
    const senderName = msg.from === currentUser ? "You" : msg.from;
    const timeStr = msg.time ? formatTime(msg.time) : "";
    chatBox.innerHTML += `
      <div>
        <strong>${senderName}</strong>
        <span style="color: gray; font-size: 11px;">${timeStr}</span>:
        ${msg.text}
        <span class="badge">${badge}</span>
      </div>
    `;
  });

  scrollToBottom();
}

// === Send Message ===
function sendMessage() {
  const to = localStorage.getItem("currentChat");
  const text = document.getElementById("msgText").value.trim();

  if (!to || !text) {
    alert("Please enter both fields.");
    return;
  }

  if (!users[to]) {
    alert("User doesn't exist.");
    return;
  }

  const timestamp = Date.now();

  if (!messages[to]) messages[to] = [];
  messages[to].push({ from: currentUser, text, time: timestamp });

  if (!messages[currentUser]) messages[currentUser] = [];
  messages[currentUser].push({ from: to, text, time: timestamp });

  localStorage.setItem("messages", JSON.stringify(messages));

  document.getElementById("msgText").value = '';
  showChat();
}

// === Scroll to Bottom of Chat ===
function scrollToBottom() {
  const chatBox = document.getElementById("chatBox");
  if (chatBox) {
    chatBox.scrollTop = chatBox.scrollHeight;
  }
}

// === Auto Refresh Chat (Simulate Real-Time) ===
function startChatUpdate() {
  setInterval(() => {
    showChat();
  }, 2000); // every 2 seconds
}

// === Format Timestamp ===
function formatTime(ts) {
  const date = new Date(ts);
  return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
}

// === Go Back (Chat Page) ===
function goBack() {
  window.location.href = "home.html"; // Go back to home page
}

// === Show Profile Info (Profile Page) ===
function showProfile() {
  const badgeInput = document.getElementById("badgeText");
  const displayBadge = document.getElementById("currentBadge");

  badgeInput.value = badges[currentUser] || '';
  displayBadge.innerText = badges[currentUser] || "No badge set.";
}

// === Save Badge ===
function saveBadge() {
  const newBadge = document.getElementById("badgeText").value.trim();
  badges[currentUser] = newBadge;
  localStorage.setItem("badges", JSON.stringify(badges));
  document.getElementById("currentBadge").innerText = newBadge || "No badge set.";
  alert("Badge saved!");
}