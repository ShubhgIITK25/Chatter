const socket = io();

const input = document.getElementById('msg-input');
const btn = document.getElementById('send-btn');
const messages = document.getElementById('messages');
const activity = document.getElementById('activity-box');
const onlineBox = document.getElementById('online-users');
const leaveBtn = document.getElementById('leave-btn');
const themeToggle = document.getElementById('theme-toggle');

if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark');
    themeToggle.textContent = 'Light Mode';
}

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    themeToggle.textContent = isDark ? 'Light Mode' : 'Dark Mode';
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
});

let username;
while (true) {
    username = prompt("Enter your name:");
    if (username === null) username = "Guest";
    if (username.trim() !== "") break;
}

function getTime() {
    const now = new Date();
    return now.getHours().toString().padStart(2, '0') + ':' +
           now.getMinutes().toString().padStart(2, '0');
}

const data = {
     user: username,
     time: getTime() 
    }
socket.emit("user joined", data);

function sendMessage() {
    const text = input.value.trim();
    if (!text) return;

    socket.emit("chat message", {
        user: username,
        text: text,
        time: getTime()
    });

    input.value = "";
}

btn.addEventListener("click", sendMessage);
input.addEventListener("keyup", (e) => {
    if (e.key === "Enter") sendMessage();
});

// Leave button
leaveBtn.addEventListener("click", () => {
    socket.emit("user left", { user: username, time: getTime() });
    socket.disconnect(); // stop receiving/sending

    input.disabled = true;
    btn.disabled = true;

    alert("You left the chat.");

    // Try to close the tab (works best if tab was opened by JS)
    window.close();
});

// Helpers to update UI
function addMessageToUI(data, isSelf) {
    const wrapper = document.createElement("div");
    wrapper.style.display = "flex";
    wrapper.style.justifyContent = isSelf ? "flex-end" : "flex-start";

    const div = document.createElement("div");
    div.className = "msg";
    div.style.textAlign = isSelf ? "right" : "left";
    div.innerHTML = `<small>${data.user} • ${data.time}</small><br>${data.text}`;

    wrapper.appendChild(div);
    messages.appendChild(wrapper);
    messages.scrollTop = messages.scrollHeight;
}

function addActivityLog(text, color) {
    const log = document.createElement("div");
    log.className = "log";
    if (color) log.style.borderLeft = `4px solid ${color}`;
    log.innerText = text;
    activity.appendChild(log);
    activity.scrollTop = activity.scrollHeight;
}

function addUserToOnline(user) {
    const div = document.createElement("div");
    div.innerText = user;
    div.dataset.user = user;
    onlineBox.appendChild(div);
}

function removeUserFromOnline(user) {
    const children = Array.from(onlineBox.children);
    children.forEach(ch => {
        if (ch.dataset.user === user) {
            onlineBox.removeChild(ch);
        }
    });
}

// Socket listeners

// Incoming chat messages
socket.on("chat message", (data) => {
    const isSelf = data.user === username;
    addMessageToUI(data, isSelf);
});

// Someone joined (for activity log)
socket.on("user joined", (data) => {
    addActivityLog(`[${data.time}] ${data.user} joined the chat`, "#2196f3");
});

// Someone left (for activity log)
socket.on("user left", (data) => {
    addActivityLog(`[${data.time}] ${data.user} left the chat`, "red");
});

// Full user list (keeps left panel correct for all, including late joiners)
socket.on("user list", (usernames) => {
    onlineBox.innerHTML = "";
    usernames.forEach(name => addUserToOnline(name));
});
