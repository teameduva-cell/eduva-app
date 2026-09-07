// EDUVA - Main Application JavaScript

// === Global Variables ===
let currentView = 'home';
let chatHistory = [];
let streak = 0;
let lastVisit = null;

// === Initialize App ===
document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
  loadUserData();
  setupEventListeners();
  checkStreak();
});

// === Initialize Application ===
function initializeApp() {
  console.log('🚀 EDUVA App Initialized');
  showView('home');
}

// === Load User Data from localStorage ===
function loadUserData() {
  const savedData = localStorage.getItem('eduva_user');
  if (savedData) {
    const data = JSON.parse(savedData);
    streak = data.streak || 0;
    lastVisit = data.lastVisit || null;
    chatHistory = data.chatHistory || [];
  }
  updateStreakDisplay();
}

// === Save User Data to localStorage ===
function saveUserData() {
  const data = {
    streak,
    lastVisit,
    chatHistory
  };
  localStorage.setItem('eduva_user', JSON.stringify(data));
}

// === Check and Update Streak ===
function checkStreak() {
  const today = new Date().toDateString();
  if (lastVisit !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (lastVisit === yesterday.toDateString()) {
      streak++;
    } else if (lastVisit !== today) {
      streak = 1;
    }
    
    lastVisit = today;
    saveUserData();
    updateStreakDisplay();
  }
}

// === Update Streak Display ===
function updateStreakDisplay() {
  const streakElements = document.querySelectorAll('.streak-count');
  streakElements.forEach(el => {
    el.textContent = streak;
  });
}

// === Setup Event Listeners ===
function setupEventListeners() {
  // Navigation
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      const view = e.currentTarget.dataset.view;
      showView(view);
    });
  });

  // Chat Input
  const chatInput = document.getElementById('chat-input');
  if (chatInput) {
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
  }

  // Send Button
  const sendBtn = document.getElementById('send-btn');
  if (sendBtn) {
    sendBtn.addEventListener('click', sendMessage);
  }

  // Voice Input
  const voiceBtn = document.getElementById('voice-btn');
  if (voiceBtn) {
    voiceBtn.addEventListener('click', startVoiceInput);
  }

  // Image Upload
  const imageInput = document.getElementById('image-input');
  if (imageInput) {
    imageInput.addEventListener('change', handleImageUpload);
  }
}

// === Show View ===
function showView(viewName) {
  currentView = viewName;
  
  // Hide all views
  document.querySelectorAll('.view').forEach(view => {
    view.classList.add('hidden');
  });
  
  // Show selected view
  const selectedView = document.getElementById(`${viewName}-view`);
  if (selectedView) {
    selectedView.classList.remove('hidden');
  }
  
  // Update navigation
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
    if (item.dataset.view === viewName) {
      item.classList.add('active');
    }
  });
  
  console.log(`📍 View changed to: ${viewName}`);
}

// === Send Message ===
async function sendMessage() {
  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  const imageInput = document.getElementById('image-input');
  const imageFile = imageInput.files[0];
  
  if (!text && !imageFile) return;
  
  // Add user message to chat
  addMessageToChat('user', text, imageFile);
  
  // Clear input
  input.value = '';
  imageInput.value = '';
  
  // Show loading
  showLoading();
  
  // Send to API
  try {
    const response = await callEduSirAPI(text, imageFile);
    hideLoading();
    addMessageToChat('ai', response);
  } catch (error) {
    hideLoading();
    addMessageToChat('ai', '❌ Error: ' + error.message);
  }
  
  saveUserData();
}

// === Add Message to Chat ===
function addMessageToChat(sender, text, image = null) {
  const messagesContainer = document.getElementById('chat-messages');
  if (!messagesContainer) return;
  
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${sender}-message animate-fade-in`;
  
  let content = '';
  
  if (image) {
    const reader = new FileReader();
    reader.onload = (e) => {
      content += `<img src="${e.target.result}" alt="Uploaded image" class="chat-image">`;
      content += `<p>${text}</p>`;
      messageDiv.innerHTML = content;
      messagesContainer.appendChild(messageDiv);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    };
    reader.readAsDataURL(image);
  } else {
    content = `<p>${text}</p>`;
    messageDiv.innerHTML = content;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
  
  chatHistory.push({ sender, text, image, timestamp: new Date() });
}

// === Show Loading ===
function showLoading() {
  const messagesContainer = document.getElementById('chat-messages');
  if (!messagesContainer) return;
  
  const loadingDiv = document.createElement('div');
  loadingDiv.id = 'loading-indicator';
  loadingDiv.className = 'message ai-message animate-pulse';
  loadingDiv.innerHTML = '<p>🤔 Edu Sir सोच रहा है...</p>';
  messagesContainer.appendChild(loadingDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// === Hide Loading ===
function hideLoading() {
  const loadingDiv = document.getElementById('loading-indicator');
  if (loadingDiv) {
    loadingDiv.remove();
  }
}

// === Call Edu Sir API ===
async function callEduSirAPI(text, imageFile = null) {
  const API_URL = '/api/chat';
  
  const payload = {
    text: text,
    image: null
  };
  
  if (imageFile) {
    const base64 = await fileToBase64(imageFile);
    payload.image = base64;
  }
  
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  
  if (!response.ok) {
    throw new Error('API request failed');
  }
  
  const data = await response.json();
  return data.response || 'No response from API';
}

// === File to Base64 ===
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// === Handle Image Upload ===
function handleImageUpload(e) {
  const file = e.target.files[0];
  if (file) {
    const preview = document.getElementById('image-preview');
    if (preview) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        preview.innerHTML = `<img src="${ev.target.result}" alt="Preview" class="preview-image">`;
        preview.classList.remove('hidden');
      };
      reader.readAsDataURL(file);
    }
  }
}

// === Start Voice Input ===
function startVoiceInput() {
  if (!('webkitSpeechRecognition' in window)) {
    alert('❌ Your browser does not support voice input');
    return;
  }
  
  const recognition = new webkitSpeechRecognition();
  recognition.lang = 'hi-IN';
  recognition.continuous = false;
  
  recognition.onstart = () => {
    console.log('🎤 Voice input started');
  };
  
  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    const input = document.getElementById('chat-input');
    if (input) {
      input.value = transcript;
    }
  };
  
  recognition.onerror = (event) => {
    console.error('Voice input error:', event.error);
  };
  
  recognition.start();
}

// === Generate Flashcards ===
function generateFlashcards(topic) {
  console.log('📇 Generating flashcards for:', topic);
  // Implementation here
}

// === Start Mock Test ===
function startMockTest(subject) {
  console.log('📝 Starting mock test for:', subject);
  // Implementation here
}

// === Export Notes as PDF ===
function exportNotesAsPDF() {
  console.log('📄 Exporting notes as PDF');
  // Implementation here
}

// === Clear Chat History ===
function clearChatHistory() {
  chatHistory = [];
  const messagesContainer = document.getElementById('chat-messages');
  if (messagesContainer) {
    messagesContainer.innerHTML = '';
  }
  saveUserData();
  console.log('🗑️ Chat history cleared');
}

// === Logout ===
function logout() {
  if (confirm('Are you sure you want to logout?')) {
    localStorage.removeItem('eduva_user');
    window.location.reload();
  }
}

console.log('✅ All JavaScript loaded successfully!');