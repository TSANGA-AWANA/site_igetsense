// Gestion du thème
const themeToggle = document.getElementById('theme-toggle');
let isDarkTheme = localStorage.getItem('theme') === 'dark';
function updateTheme() {
  document.body.classList.toggle('dark-theme', isDarkTheme);
  themeToggle.textContent = isDarkTheme ? '☀️' : '🌙';
  localStorage.setItem('theme', isDarkTheme ? 'dark' : 'light');
}
if (window.matchMedia('(prefers-color-scheme: dark)').matches && !localStorage.getItem('theme')) {
  isDarkTheme = true;
}
updateTheme();
themeToggle.addEventListener('click', () => {
  isDarkTheme = !isDarkTheme;
  updateTheme();
});

// Gestion de la sauvegarde des chats dans le localStorage
let chatHistory = JSON.parse(localStorage.getItem('chatHistory')) || { 1: [] };
let currentChat = localStorage.getItem('currentChat') || 1;

function updateLocalStorage() {
  localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
  localStorage.setItem('currentChat', currentChat);
}

function updateChatHistory() {
  const chatHistoryDiv = document.getElementById('chat-history');
  chatHistoryDiv.innerHTML = Object.keys(chatHistory)
    .map(chatId => `<div onclick="loadChat(${chatId})">Chat ${chatId}</div>`)
    .join('');
}

// Chargement des messages du chat courant
function loadChat(chatId) {
  currentChat = chatId;
  updateLocalStorage();
  const messages = chatHistory[chatId];
  const chatMessages = document.getElementById('chat-messages');
  chatMessages.innerHTML = messages.length
    ? messages.join('')
    : '<div class="message bot">Aucun message dans ce chat.</div>';
}

// Création d'un nouveau chat
function newChat() {
  currentChat = Object.keys(chatHistory).length + 1;
  chatHistory[currentChat] = [];
  document.getElementById('chat-messages').innerHTML =
    '<div class="message bot">Nouveau chat démarré.</div>';
  updateChatHistory();
  updateLocalStorage();
}

// Envoi d'un message utilisateur
function sendMessage() {
  const input = document.getElementById('user-input');
  const message = input.value.trim();
  if (message) {
    const chatMessages = document.getElementById('chat-messages');
    const userMsg = `<div class="message user">${message}</div>`;
    chatMessages.innerHTML += userMsg;
    input.value = '';
    chatHistory[currentChat].push(userMsg);
    updateLocalStorage();
    simulateBotResponse();
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
}

// Simulation d'une réponse de l'IA avec effet "typing..."
function simulateBotResponse() {
  const chatMessages = document.getElementById('chat-messages');
  const typingMessage = document.createElement('div');
  typingMessage.classList.add('message', 'bot');
  typingMessage.id = 'typing-message';
  typingMessage.textContent = '...';
  chatMessages.appendChild(typingMessage);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  setTimeout(() => {
    typingMessage.textContent = 'Je suis une IA. Comment puis-je vous aider ?';
    chatHistory[currentChat].push(typingMessage.outerHTML);
    updateLocalStorage();
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }, 1000);
}

// Envoi de fichier avec prévisualisation du nom du fichier
function sendFile() {
  const input = document.createElement('input');
  input.type = 'file';
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const chatMessages = document.getElementById('chat-messages');
      const fileMsg = `<div class="message user">Fichier envoyé : ${file.name}</div>`;
      chatMessages.innerHTML += fileMsg;
      chatHistory[currentChat].push(fileMsg);
      updateLocalStorage();
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  };
  input.click();
}

function handleKeyPress(e) {
  if (e.key === 'Enter') {
    sendMessage();
  }
}

// Initialisation au chargement de la page
window.onload = () => {
  updateChatHistory();
  loadChat(currentChat);
};

// Gestion de la barre latérale
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const openBtn = document.getElementById('open-sidebar-btn');
  const chatInputContainer = document.getElementById('chat-input-container');
  
  sidebar.classList.toggle('hidden');
  const isHidden = sidebar.classList.contains('hidden');
  // Sur mobile, le sidebar s'affiche en overlay sans décaler le contenu
  if (window.innerWidth > 768) {
    openBtn.style.display = isHidden ? 'block' : 'none';
    chatInputContainer.classList.toggle('expanded', isHidden);
  }
}