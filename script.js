const chatInput = document.querySelector('#chat-input input[type="text"]');
const sendButton = document.querySelector('#send-button');
const chatHistory = document.querySelector('#chat-history');
const onlineUsers = new Set();

// Check if user has already entered their name
let userName = localStorage.getItem('userName');
if (!userName) {
  // If not, ask for their name and store it in local storage
  userName = prompt('Please enter your name:');
  localStorage.setItem('userName', userName);
}

// Display user's name in chat header
const chatHeader = document.querySelector('#chat-header');
chatHeader.querySelector('h2').textContent = userName;

// Initialize socket.io
const socket = io();

// Send chat message to server
function sendChatMessage() {
  const message = chatInput.value;
  if (message) {
    socket.emit('chat message', { message, userName });
    chatInput.value = '';
  }
}

// Listen for send button click and enter key press
sendButton.addEventListener('click', sendChatMessage);
chatInput.addEventListener('keypress', (event) => {
  if (event.key === 'Enter') {
    sendChatMessage();
  }
});

// Receive chat message from server and display it in chat history
socket.on('chat message', (data) => {
  const { message, userName } = data;
  const isCurrentUser = userName === localStorage.getItem('userName');
  const messageContainer = document.createElement('div');
  messageContainer.classList.add('message-container');
  if (isCurrentUser) {
    messageContainer.classList.add('current-user');
  } else {
    messageContainer.classList.add('other-user');
    if (!onlineUsers.has(userName)) {
      onlineUsers.add(userName);
      displayOnlineUsers();
    }
  }
  const messageBubble = document.createElement('div');
  messageBubble.classList.add('message-bubble');
  messageBubble.textContent = message;
  const userNameElement = document.createElement('div');
  userNameElement.classList.add('user-name');
  userNameElement.textContent = userName;
  messageContainer.appendChild(userNameElement);
  messageContainer.appendChild(messageBubble);
  chatHistory.appendChild(messageContainer);
  chatHistory.scrollTop = chatHistory.scrollHeight;
});

// Update online users list
function displayOnlineUsers() {
  const onlineUsersList = document.querySelector('#online-users ul');
  onlineUsersList.innerHTML = '';
  for (const user of onlineUsers) {
    const userElement = document.createElement('li');
    userElement.textContent = user;
    onlineUsersList.appendChild(userElement);
  }
}

// Poll the server to see if user is still connected
setInterval(() => {
  socket.emit('poll', { userName });
}, 1000);

// Receive online user list from server and update local set
socket.on('online users', (data) => {
  const { users } = data;
  onlineUsers.clear();
  for (const user of users) {
    onlineUsers.add(user);
  }
  displayOnlineUsers();
});

// Remove user name from local storage on window unload
window.addEventListener('unload', () => {
  localStorage.removeItem('userName');
});

// Notify server when user disconnects
socket.on('disconnect', () => {
  socket.emit('disconnect', { userName });
});
