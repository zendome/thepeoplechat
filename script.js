// === Global Variables ===
let currentUser = localStorage.getItem("currentUser") || null;
const users = JSON.parse(localStorage.getItem("users") || "{}");
const messages = JSON.parse(localStorage.getItem("messages") || "{}");
const badges = JSON.parse(localStorage.getItem("badges") || "{}");

// === Signup ===
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
  alert("Signed up! Now log in.");
}

// === Login ===
function login() {
  const user = document.getElementById("username").value;
  const pass = document.getElementById("password").value;

  if (!user || !pass) {
    alert("Please enter both a username and password.");
    return;
  }

  if (!users[user] || users[user].password !== pass) {
    alert("Invalid username or password.");
    return;
  }

  localStorage.setItem("currentUser", user);
  window.location.href = "home.html"; // Redirect to home page after login
}

// === Logout ===
function logout() {
  localStorage.removeItem("currentUser");
  window.location.href = "index.html";
}

// === On Page Load (home.html only) ===
window.onload = function () {
  if (window.location.pathname.includes("home.html")) {
    if (!currentUser) {
      window.location.href = "index.html"; // Redirect if not logged in
      return;
    }

    document.getElementById("welcomeUser").innerText = "Welcome, " + currentUser;
    showUsers();
    showMessages();
  }

  if (window.location.pathname.includes("profile.html")) {
    if (!currentUser) {
      window.location.href = "index.html"; // Redirect if not logged in
      return;
    }

    showProfile();
  }

  if (window.location.pathname.includes("chat.html")) {
    if (!currentUser) {
      window.location.href = "index.html"; // Redirect if not logged in
      return;
    }

    showChat();
  }
};

// === Show Users & Badges (home.html) ===
function showUsers() {
  const container = document.getElementById("userList");
  container.innerHTML = '';
  for (let user in users) {
    if (user !== currentUser) {
      const badge = badges[user] || ''; // Show the badge if there is one
      container.innerHTML += `
        <div class="user-box">
          <strong>${user}</strong><br>
          <span class="badge">${badge}</span><br>
          <button onclick="openChat('${user}')">Chat</button>
        </div>
      `;
    }
  }
}

// === Set Badge (profile.html) ===
function setBadge() {
  const badgeInput = document.getElementById("badgeInput").value;
  badges[currentUser] = badgeInput;
  localStorage.setItem("badges", JSON.stringify(badges));
  showProfile();  // Update the profile page with the new badge
}

// === Show Profile (profile.html) ===
function showProfile() {
  const profileBox = document.getElementById("profileBox");
  const badge = badges[currentUser] || ''; // Get current badge

  profileBox.innerHTML = `
    <h2>Your Profile</h2>
    <p><strong>Username:</strong> ${currentUser}</p>
    <p><strong>Badge:</strong> ${badge || "No badge set"}</p>
    <input id="badgeInput" value="${badge}" placeholder="Set your badge">
    <button onclick="setBadge()">Save Badge</button>
  `;
}

// === Open Chat with a User (home.html) ===
function openChat(user) {
  localStorage.setItem("currentChat", user);
  window.location.href = "chat.html";
}

// === Show Chat (chat.html) ===
function showChat() {
  const chatWith = localStorage.getItem("currentChat");
  if (!chatWith) {
    alert("No user selected for chat.");
    window.location.href = "home.html";
    return;
  }

  document.getElementById("chatWithUser").innerText = chatWith;

  const chatBox = document.getElementById("chatBox");
  chatBox.innerHTML = '';
  const chatHistory = messages[chatWith] || [];

  chatHistory.forEach(msg => {
    const badge = badges[msg.from] || ''; // Get the badge for the sender
    if (msg.from === currentUser) {
      chatBox.innerHTML += `
        <div><strong>You:</strong> ${msg.text} <span class="badge">${badge}</span></div>
      `;
    } else {
      chatBox.innerHTML += `
        <div><strong>${msg.from}:</strong> ${msg.text} <span class="badge">${badge}</span></div>
      `;
    }
  });
}

// === Send Message (chat.html) ===
function sendMessage() {
  const to = localStorage.getItem("currentChat");
  const text = document.getElementById("msgText").value;

  if (!to || !text) {
    alert("Please fill in both fields.");
    return;
  }

  if (!users[to]) {
    alert("User doesn't exist.");
    return;
  }

  // Ensure we only store the message once in both users' histories
  if (!messages[to]) messages[to] = [];
  messages[to].push({ from: currentUser, text: text });
  if (!messages[currentUser]) messages[currentUser] = [];
  messages[currentUser].push({ from: to, text: text });

  localStorage.setItem("messages", JSON.stringify(messages));

  // Clear the input field after sending message
  document.getElementById("msgText").value = '';

  // Refresh the chat to show the new message
  showChat();
  scrollToBottom();
}

// === Real-Time Update for New Messages (chat.html) ===
function startChatUpdate() {
  const chatWith = localStorage.getItem("currentChat");

  // Use WebSockets or Polling here for real-time update (for now we use a simple setInterval approach for simulation)
  setInterval(() => {
    const chatBox = document.getElementById("chatBox");
    const chatHistory = messages[chatWith] || [];

    chatBox.innerHTML = '';
    chatHistory.forEach(msg => {
      const badge = badges[msg.from] || '';
      if (msg.from === currentUser) {
        chatBox.innerHTML += `
          <div><strong>You:</strong> ${msg.text} <span class="badge">${badge}</span></div>
        `;
      } else {
        chatBox.innerHTML += `
          <div><strong>${msg.from}:</strong> ${msg.text} <span class="badge">${badge}</span></div>
        `;
      }
    });
    
    scrollToBottom();  // Scroll to bottom for new messages
  }, 2000);  // Update every 2 seconds
}

// === Scroll Chat to Bottom ===
function scrollToBottom() {
  const chatBox = document.getElementById("chatBox");
  chatBox.scrollTop = chatBox.scrollHeight;
}

// === Go Back to Home Page (chat.html) ===
function goBack() {
  window.location.href = "home.html";
}