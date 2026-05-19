const { requireAuth, clearAuth, post, getUser } = window.AITutorAPI;

const state = {
  chatHistory: JSON.parse(localStorage.getItem('aiTutor.adminChatHistory') || '[]'),
};

const els = {
  signedInAs: document.getElementById('signedInAs'),
  logoutButton: document.getElementById('logoutButton'),
  chatThread: document.getElementById('chatThread'),
  chatForm: document.getElementById('chatForm'),
  chatInput: document.getElementById('chatInput'),
  chatMode: document.getElementById('chatMode'),
  chatLevel: document.getElementById('chatLevel'),
  activityLog: document.getElementById('activityLog'),
};

function escapeHtml(value) {
  return String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

function formatTime(value) {
  const date = new Date(value || Date.now());
  return Number.isNaN(date.getTime()) ? 'now' : date.toLocaleTimeString();
}

function renderChat() {
  if (!els.chatThread) {
    return;
  }

  if (!state.chatHistory.length) {
    els.chatThread.innerHTML = '<p class="muted">No chat messages yet.</p>';
    return;
  }

  els.chatThread.innerHTML = state.chatHistory.map((item) => `
    <div class="bubble ${item.role}">
      <div class="bubble-meta">${escapeHtml(item.role)} · ${escapeHtml(formatTime(item.timestamp))}</div>
      <div>${escapeHtml(item.content)}</div>
    </div>
  `).join('');
  els.chatThread.scrollTop = els.chatThread.scrollHeight;
}

function renderActivity(message) {
  if (!els.activityLog) {
    return;
  }

  els.activityLog.innerHTML = `<article class="log-item"><strong>Chat tester</strong><p class="muted">${escapeHtml(message)}</p></article>`;
}

function persistHistory() {
  localStorage.setItem('aiTutor.adminChatHistory', JSON.stringify(state.chatHistory.slice(-40)));
}

function appendMessage(role, content) {
  state.chatHistory.push({ role, content, timestamp: new Date().toISOString() });
  persistHistory();
  renderChat();
}

async function sendChat(event) {
  event.preventDefault();
  const message = els.chatInput?.value.trim();
  if (!message) {
    return;
  }

  const mode = els.chatMode?.value || 'knowledge';
  const level = els.chatLevel?.value || 'Intermediate';
  els.chatInput.value = '';
  appendMessage('user', message);
  appendMessage('assistant', 'Typing...');
  const typingIndex = state.chatHistory.length - 1;

  try {
    const response = await post('/api/chat', {
      message,
      mode,
      level,
      scenario: 'admin-chat',
      conversationId: 'admin-chat',
      userId: getUser()?.id || 'admin',
    });

    state.chatHistory.splice(typingIndex, 1, {
      role: 'assistant',
      content: response.reply || 'No reply returned.',
      timestamp: new Date().toISOString(),
    });
    persistHistory();
    renderChat();
    renderActivity('POST /api/chat succeeded.');
  } catch (error) {
    state.chatHistory.splice(typingIndex, 1, {
      role: 'assistant',
      content: `Error: ${error.message}`,
      timestamp: new Date().toISOString(),
    });
    persistHistory();
    renderChat();
    renderActivity(`Chat failed: ${error.message}`);
  }
}

function init() {
  if (!requireAuth()) {
    return;
  }

  if (els.signedInAs) {
    const user = getUser();
    els.signedInAs.textContent = user?.email ? `Signed in as ${user.email}` : 'Signed in';
  }

  if (els.logoutButton) {
    els.logoutButton.addEventListener('click', () => {
      clearAuth();
      window.location.href = 'auth.html';
    });
  }

  if (els.chatForm) {
    els.chatForm.addEventListener('submit', sendChat);
  }

  renderChat();
  renderActivity('Admin chat panel loaded.');
}

init();
