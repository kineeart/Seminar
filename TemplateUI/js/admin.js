const {
  requireAuth,
  clearAuth,
  get,
  post,
  getUser,
} = window.AITutorAPI;

const SERVICE_ENDPOINTS = [
  { key: 'gateway', label: 'Gateway', path: '/health', optional: false },
  { key: 'auth', label: 'Auth', path: '/api/auth/health', optional: false },
  { key: 'chat', label: 'Chat', path: '/api/chat/health', optional: false },
  { key: 'content', label: 'Content', path: '/api/content/health', optional: false },
  { key: 'flashcards', label: 'Flashcards', path: '/api/flashcards/health', optional: true },
  { key: 'quizzes', label: 'Quizzes', path: '/api/quizzes/health', optional: true },
  { key: 'analytics', label: 'Analytics', path: '/api/analytics/health', optional: true },
];

const state = {
  health: {},
  servicesOnline: 0,
  users: [],
  chatHistory: JSON.parse(localStorage.getItem('aiTutor.adminChatHistory') || '[]'),
  activity: [],
};

const els = {
  signedInAs: document.getElementById('signedInAs'),
  refreshButton: document.getElementById('refreshButton'),
  logoutButton: document.getElementById('logoutButton'),
  overviewCards: document.getElementById('overviewCards'),
  healthSummary: document.getElementById('healthSummary'),
  healthGrid: document.getElementById('healthGrid'),
  usersBody: document.getElementById('usersBody'),
  usersEmpty: document.getElementById('usersEmpty'),
  usersStatus: document.getElementById('usersStatus'),
  chatThread: document.getElementById('chatThread'),
  chatForm: document.getElementById('chatForm'),
  chatInput: document.getElementById('chatInput'),
  chatMode: document.getElementById('chatMode'),
  chatLevel: document.getElementById('chatLevel'),
  activityLog: document.getElementById('activityLog'),
  modal: document.getElementById('modal'),
  modalTitle: document.getElementById('modalTitle'),
  modalBody: document.getElementById('modalBody'),
  modalClose: document.getElementById('modalClose'),
};

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function formatTime(value) {
  if (!value) return 'now';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'now' : date.toLocaleTimeString();
}

function badge(status, optional = false) {
  const tone = status === 'ok' ? 'ok' : status === 'down' ? 'down' : 'neutral';
  const label = status === 'ok' ? 'OK' : status === 'down' ? 'DOWN' : 'UNKNOWN';
  return `<span class="badge ${tone}">${label}${optional ? ' optional' : ''}</span>`;
}

function openModal(title, body) {
  if (!els.modal || !els.modalTitle || !els.modalBody) {
    return;
  }
  els.modalTitle.textContent = title;
  els.modalBody.innerHTML = body;
  els.modal.hidden = false;
}

function closeModal() {
  if (!els.modal) {
    return;
  }
  els.modal.hidden = true;
}

function renderOverview() {
  if (!els.overviewCards) {
    return;
  }
  const authStatus = state.health.auth?.status === 'ok' ? 'ok' : 'down';
  const chatStatus = state.health.chat?.status === 'ok' ? 'ok' : 'down';
  const gatewayStatus = state.health.gateway?.status === 'ok' ? 'ok' : 'down';
  const analyticsStatus = state.health.analytics?.status === 'ok' ? 'ok' : 'down';
  els.overviewCards.innerHTML = `
    <article class="card stat"><p class="label">Total services online</p><div class="stat-value">${state.servicesOnline}</div><p class="muted">Includes optional services when available</p></article>
    <article class="card stat"><p class="label">Gateway</p><div class="stat-value">${badge(gatewayStatus)}</div><p class="muted">Base API entry point</p></article>
    <article class="card stat"><p class="label">Auth</p><div class="stat-value">${badge(authStatus)}</div><p class="muted">Login and user account service</p></article>
    <article class="card stat"><p class="label">Chat</p><div class="stat-value">${badge(chatStatus)}</div><p class="muted">Gemini-backed tutor endpoint</p></article>
    <article class="card stat"><p class="label">Analytics</p><div class="stat-value">${badge(analyticsStatus, true)}</div><p class="muted">Gateway request logging and prompt control</p></article>
  `;
}

function renderHealth() {
  if (!els.healthGrid || !els.healthSummary) {
    return;
  }
  const cards = SERVICE_ENDPOINTS.map((service) => {
    const item = state.health[service.key] || { status: 'down', message: 'Not checked yet' };
    return `
      <article class="card health-card">
        <div class="between"><h3>${service.label}</h3>${badge(item.status, service.optional)}</div>
        <p class="muted">${escapeHtml(item.message || 'No response')}</p>
        <button class="text-button" data-health-retry="${service.key}" type="button">Retry</button>
      </article>
    `;
  }).join('');

  els.healthGrid.innerHTML = cards;
  els.healthSummary.innerHTML = `
    <div class="summary-row"><span>Last checked</span><strong>${new Date().toLocaleTimeString()}</strong></div>
    <div class="summary-row"><span>Services online</span><strong>${state.servicesOnline}/${SERVICE_ENDPOINTS.length}</strong></div>
  `;

  els.healthGrid.querySelectorAll('[data-health-retry]').forEach((button) => {
    button.addEventListener('click', () => refreshHealth(button.dataset.healthRetry));
  });
}

function renderUsers() {
  if (!els.usersBody || !els.usersEmpty) {
    return;
  }
  if (!state.users.length) {
    els.usersBody.innerHTML = '';
    els.usersEmpty.hidden = false;
    return;
  }

  els.usersEmpty.hidden = true;
  els.usersBody.innerHTML = state.users.map((user) => `
    <tr>
      <td>${escapeHtml(user.id || user._id || '-')}</td>
      <td>${escapeHtml(user.email || '-')}</td>
      <td>${escapeHtml(user.createdAt || user.created_at || '-')}</td>
    </tr>
  `).join('');
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
      <div class="bubble-body">${escapeHtml(item.content)}</div>
    </div>
  `).join('');
  els.chatThread.scrollTop = els.chatThread.scrollHeight;
}

function renderActivityLog(entries) {
  if (!els.activityLog) {
    return;
  }
  els.activityLog.innerHTML = entries.map((entry) => `
    <article class="log-item">
      <div class="between"><strong>${escapeHtml(entry.title)}</strong><span class="muted">${escapeHtml(formatTime(entry.time))}</span></div>
      <p class="muted">${escapeHtml(entry.message)}</p>
    </article>
  `).join('');
}

function appendChatMessage(role, content) {
  state.chatHistory.push({ role, content, timestamp: new Date().toISOString() });
  localStorage.setItem('aiTutor.adminChatHistory', JSON.stringify(state.chatHistory.slice(-40)));
  renderChat();
}

async function refreshHealth(targetKey = null) {
  const targets = targetKey ? SERVICE_ENDPOINTS.filter((service) => service.key === targetKey) : SERVICE_ENDPOINTS;
  const results = await Promise.allSettled(targets.map(async (service) => {
    const data = await get(service.path, { auth: false });
    return {
      key: service.key,
      status: 'ok',
      message: data.message || data.service || 'Healthy',
    };
  }));

  targets.forEach((service, index) => {
    const result = results[index];
    if (result.status === 'fulfilled') {
      state.health[service.key] = result.value;
    } else {
      state.health[service.key] = {
        status: 'down',
        message: result.reason?.message || 'Request failed',
      };
    }
  });

  state.servicesOnline = Object.values(state.health).filter((item) => item.status === 'ok').length;
  state.activity.unshift({ title: 'Health refresh', message: 'System health monitor refreshed successfully.', time: new Date().toISOString() });
  renderOverview();
  renderHealth();
  renderActivityLog(state.activity.slice(0, 8));
}

async function loadUsers() {
  if (!els.usersStatus) {
    return;
  }
  els.usersStatus.textContent = 'Loading users...';
  try {
    const response = await get('/api/auth/users');
    const users = Array.isArray(response.users) ? response.users : Array.isArray(response) ? response : [];
    state.users = users;
    els.usersStatus.textContent = `${users.length} users loaded.`;
  } catch (error) {
    state.users = [];
    els.usersStatus.textContent = error.status === 404 ? 'Not implemented yet' : `Users unavailable: ${error.message}`;
  }
  renderUsers();
}

async function sendChat(event) {
  event.preventDefault();
  if (!els.chatInput || !els.chatMode || !els.chatLevel) {
    return;
  }
  const message = els.chatInput.value.trim();
  if (!message) {
    return;
  }

  const mode = els.chatMode.value;
  const level = els.chatLevel.value;
  els.chatInput.value = '';
  appendChatMessage('user', message);
  appendChatMessage('assistant', 'Typing...');
  const typingIndex = state.chatHistory.length - 1;

  try {
    const response = await post('/api/chat', {
      message,
      mode,
      level,
      scenario: 'admin-dashboard',
      conversationId: 'admin-dashboard',
      userId: getUser()?.id || 'admin',
    });

    state.chatHistory.splice(typingIndex, 1, {
      role: 'assistant',
      content: response.reply || 'No reply returned.',
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem('aiTutor.adminChatHistory', JSON.stringify(state.chatHistory.slice(-40)));
    renderChat();
    state.activity.unshift({ title: 'Chat request', message: 'POST /api/chat succeeded.', time: new Date().toISOString() });
    renderActivityLog(state.activity.slice(0, 8));
  } catch (error) {
    state.chatHistory.splice(typingIndex, 1, {
      role: 'assistant',
      content: `Error: ${error.message}`,
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem('aiTutor.adminChatHistory', JSON.stringify(state.chatHistory.slice(-40)));
    renderChat();
    openModal('Chat failed', `<p>${escapeHtml(error.message)}</p>`);
  }
}

function init() {
  if (!requireAuth()) {
    return;
  }

  const user = getUser();
  if (els.signedInAs) {
    els.signedInAs.textContent = user?.email ? `Signed in as ${user.email}` : 'Signed in';
  }
  if (els.logoutButton) {
    els.logoutButton.addEventListener('click', () => {
      clearAuth();
      window.location.href = 'auth.html';
    });
  }
  if (els.refreshButton) {
    els.refreshButton.addEventListener('click', () => {
      refreshHealth();
      loadUsers();
    });
  }
  if (els.chatForm) {
    els.chatForm.addEventListener('submit', sendChat);
  }
  if (els.modalClose) {
    els.modalClose.addEventListener('click', closeModal);
  }
  if (els.modal) {
    els.modal.addEventListener('click', (event) => {
      if (event.target === els.modal) {
        closeModal();
      }
    });
  }

  if (els.chatThread) {
    renderChat();
  }
  if (els.activityLog) {
    renderActivityLog([{ title: 'Dashboard ready', message: 'Admin dashboard loaded.', time: new Date().toISOString() }]);
  }
  if (els.healthGrid || els.healthSummary || els.overviewCards) {
    refreshHealth();
  }
  if (els.usersBody || els.usersStatus) {
    loadUsers();
  }

  if (els.chatThread && els.activityLog && !els.healthGrid && !els.usersBody) {
    renderActivityLog([{ title: 'Control panel ready', message: 'Focused admin page loaded.', time: new Date().toISOString() }]);
  }

  if (els.modalClose && els.modal && els.modalTitle && els.modalBody) {
    els.modal.hidden = true;
  }
  if (els.modal && !els.modal.hidden) {
    closeModal();
  }
  if (els.modal && !els.modalTitle) {
    closeModal();
  }
  if (els.modal && !els.modalBody) {
    closeModal();
  }
  if (els.chatThread && els.activityLog && els.overviewCards && els.healthGrid && els.usersBody) {
    return;
  }
  if (els.chatThread && els.activityLog && els.overviewCards) {
    return;
  }
  if (els.chatThread && !els.healthGrid && !els.usersBody) {
    return;
  }
}

init();
