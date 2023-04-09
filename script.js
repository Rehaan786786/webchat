const chatInput = document.querySelector('#chat-input input[type="text"]');
const sendButton = document.querySelector('#send-button');
const chatHistory = document.querySelector('#chat-history');

// Ask for user's name
const userName = prompt('Please enter your name:');

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
