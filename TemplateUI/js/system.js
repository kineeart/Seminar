const { requireAuth, clearAuth, get } = window.AITutorAPI;

const SERVICES = [
  { key: 'gateway', label: 'Gateway', path: '/health', optional: false },
  { key: 'auth', label: 'Auth', path: '/api/auth/health', optional: false },
  { key: 'chat', label: 'Chat', path: '/api/chat/health', optional: false },
  { key: 'content', label: 'Content', path: '/api/content/health', optional: false },
  { key: 'flashcards', label: 'Flashcards', path: '/api/flashcards/health', optional: true },
  { key: 'quizzes', label: 'Quizzes', path: '/api/quizzes/health', optional: true },
  { key: 'analytics', label: 'Analytics', path: '/api/analytics/health', optional: true },
];

const state = { health: {}, logs: [] };

const els = {
  signedInAs: document.getElementById('signedInAs'),
  refreshButton: document.getElementById('refreshButton'),
  logoutButton: document.getElementById('logoutButton'),
  healthSummary: document.getElementById('healthSummary'),
  healthGrid: document.getElementById('healthGrid'),
  activityLog: document.getElementById('activityLog'),
};

function escapeHtml(value) {
  return String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

function badge(status, optional = false) {
  const tone = status === 'ok' ? 'ok' : status === 'down' ? 'down' : 'neutral';
  const label = status === 'ok' ? 'OK' : status === 'down' ? 'DOWN' : 'UNKNOWN';
  return `<span class="badge ${tone}">${label}${optional ? ' optional' : ''}</span>`;
}

function renderHealth() {
  if (!els.healthGrid || !els.healthSummary) {
    return;
  }

  els.healthSummary.innerHTML = `
    <div class="summary-row"><span>Services online</span><strong>${Object.values(state.health).filter((item) => item.status === 'ok').length}/${SERVICES.length}</strong></div>
    <div class="summary-row"><span>Last checked</span><strong>${new Date().toLocaleTimeString()}</strong></div>
  `;

  els.healthGrid.innerHTML = SERVICES.map((service) => {
    const item = state.health[service.key] || { status: 'down', message: 'Not checked yet' };
    return `
      <article class="card">
        <div class="between"><h3>${service.label}</h3>${badge(item.status, service.optional)}</div>
        <p class="muted">${escapeHtml(item.message || 'No response')}</p>
      </article>
    `;
  }).join('');
}

function renderActivity() {
  if (!els.activityLog) {
    return;
  }

  if (!state.logs.length) {
    els.activityLog.innerHTML = '<div class="empty-state">No recent system activity.</div>';
    return;
  }

  els.activityLog.innerHTML = state.logs.map((entry) => `
    <article class="log-item"><strong>${escapeHtml(entry.title)}</strong><p class="muted">${escapeHtml(entry.message)}</p></article>
  `).join('');
}

async function refreshSystem() {
  const results = await Promise.allSettled(SERVICES.map(async (service) => {
    const data = await get(service.path, { auth: false });
    return { key: service.key, status: 'ok', message: data.message || data.service || 'Healthy' };
  }));

  results.forEach((result, index) => {
    const service = SERVICES[index];
    state.health[service.key] = result.status === 'fulfilled'
      ? result.value
      : { status: 'down', message: result.reason?.message || 'Request failed' };
  });

  state.logs.unshift({ title: 'System refresh', message: 'Service health monitor refreshed.' });
  renderHealth();
  renderActivity();
}

function init() {
  if (!requireAuth()) {
    return;
  }

  if (els.signedInAs) {
    const user = window.AITutorAPI.getUser();
    els.signedInAs.textContent = user?.email ? `Signed in as ${user.email}` : 'Signed in';
  }

  if (els.logoutButton) {
    els.logoutButton.addEventListener('click', () => {
      clearAuth();
      window.location.href = 'auth.html';
    });
  }

  if (els.refreshButton) {
    els.refreshButton.addEventListener('click', refreshSystem);
  }

  refreshSystem().catch((error) => {
    state.logs = [{ title: 'Refresh failed', message: error.message }];
    renderActivity();
  });
}

init();
