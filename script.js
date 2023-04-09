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

// Send message when "Send" button is clicked
sendButton.addEventListener('click', () => {
  const messageContent = chatInput.value.trim();
  if (messageContent !== '') {
    const messageContainer = document.createElement('div');
    messageContainer.classList.add('chat-message', 'sent-message');
    const messageText = document.createElement('p');
    messageText.classList.add('message-content');
    messageText.textContent = messageContent;
    const messageTimestamp = document.createElement('span');
    messageTimestamp.classList.add('message-timestamp');
    messageTimestamp.textContent = getCurrentTime();
    messageContainer.appendChild(messageText);
    messageContainer.appendChild(messageTimestamp);
    chatHistory.appendChild(messageContainer);
    chatInput.value = '';

    // Send message to all online users
    onlineUsers.forEach(user => {
      if (user !== userName) {
        sendMessage(userName, user, messageContent);
      }
    });
  }
});

// Get current time in format HH:mm
function getCurrentTime() {
  const now = new Date();
  let hours = now.getHours();
  let minutes = now.getMinutes();
  if (hours < 10) {
    hours = '0' + hours;
  }
  if (minutes < 10) {
    minutes = '0' + minutes;
  }
  return `${hours}:${minutes}`;
}

// Send a message from one user to another
function sendMessage(sender, recipient, message) {
  const messageContainer = document.createElement('div');
  messageContainer.classList.add('chat-message', 'received-message');
  const messageText = document.createElement('p');
  messageText.classList.add('message-content');
  messageText.textContent = message;
  const messageTimestamp = document.createElement('span');
  messageTimestamp.classList.add('message-timestamp');
  messageTimestamp.textContent = getCurrentTime();
  const messageSender = document.createElement('span');
  messageSender.classList.add('message-sender');
  messageSender.textContent = sender;
  messageContainer.appendChild(messageSender);
  messageContainer.appendChild(messageText);
  messageContainer.appendChild(messageTimestamp);

  // Check if recipient is online
  if (onlineUsers.has(recipient)) {
    const recipientChatHistory = document.querySelector(`#chat-history-${recipient}`);
    recipientChatHistory.appendChild(messageContainer);
  } else {
    // If recipient is offline, display message in sender's chat history
    chatHistory.appendChild(messageContainer);
  }
}

// Ask for recipient's name and send message when user presses enter key
chatInput.addEventListener('keypress', event => {
  if (event.key === 'Enter') {
    const messageContent = chatInput.value.trim();
    if (messageContent !== '') {
      const recipientName = prompt('Please enter the name of the person you want to send a message to:');
      if (recipientName && recipientName !== userName) {
        sendMessage(userName, recipientName, messageContent);
      }
    }
  }
});

// Detect when a new user enters the chat
window.addEventListener('beforeunload', () => {
  onlineUsers.delete(userName);
  localStorage.removeItem('userName');
});

// Poll the server to check for new


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
