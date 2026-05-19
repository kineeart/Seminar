const { requireAuth, clearAuth, get } = window.AITutorAPI;

const state = { summary: null, logs: [] };

const els = {
  signedInAs: document.getElementById('signedInAs'),
  refreshButton: document.getElementById('refreshButton'),
  logoutButton: document.getElementById('logoutButton'),
  overviewCards: document.getElementById('overviewCards'),
  logList: document.getElementById('logList'),
  chatStats: document.getElementById('chatStats'),
  flashcardStats: document.getElementById('flashcardStats'),
  topicStats: document.getElementById('topicStats'),
};

function escapeHtml(value) {
  return String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

function renderOverview() {
  if (!els.overviewCards || !state.summary) {
    return;
  }

  els.overviewCards.innerHTML = `
    <article class="card stat"><p class="label">Requests tracked</p><div class="stat-value">${state.summary.totalRequests || 0}</div><p class="muted">Logged through the gateway</p></article>
    <article class="card stat"><p class="label">Prompts stored</p><div class="stat-value">${state.summary.totalPrompts || 0}</div><p class="muted">Editable admin prompts</p></article>
    <article class="card stat"><p class="label">Chat users</p><div class="stat-value">${state.summary.totalUsersTracked || 0}</div><p class="muted">Users with chat activity</p></article>
    <article class="card stat"><p class="label">Flashcard users</p><div class="stat-value">${state.summary.totalFlashcardUsersTracked || 0}</div><p class="muted">Users with flashcard activity</p></article>
  `;
}

function renderLogs() {
  if (!els.logList) {
    return;
  }

  if (!state.logs.length) {
    els.logList.innerHTML = '<div class="empty-state">No logs yet.</div>';
    return;
  }

  els.logList.innerHTML = state.logs.map((log) => `
    <article class="log-item">
      <div class="between"><strong>${escapeHtml(log.method || 'GET')} ${escapeHtml(log.endpoint || '-')}</strong><span class="muted">${escapeHtml(log.service || 'gateway')}</span></div>
      <p class="muted">${escapeHtml(log.intent || 'unknown')} · ${escapeHtml(log.topic || 'general')} · ${escapeHtml(String(log.response_time || 0))} ms</p>
    </article>
  `).join('');
}

function renderGroupedStats(target, items, labelKey, valueKey) {
  if (!target) {
    return;
  }

  if (!items?.length) {
    target.innerHTML = '<div class="empty-state">No data yet.</div>';
    return;
  }

  target.innerHTML = items.map((item) => `
    <div class="summary-row"><span>${escapeHtml(item[labelKey] || item._id || 'unknown')}</span><strong>${escapeHtml(String(item[valueKey] ?? item.count ?? 0))}</strong></div>
  `).join('');
}

async function refreshAnalytics() {
  const [summaryResponse, logsResponse, chatResponse, flashcardResponse, topicsResponse] = await Promise.all([
    get('/api/analytics/stats'),
    get('/api/analytics/logs?limit=15'),
    get('/api/analytics/chat'),
    get('/api/analytics/flashcards'),
    get('/api/analytics/topics'),
  ]);

  state.summary = summaryResponse.summary || {};
  state.logs = logsResponse.logs || [];
  renderOverview();
  renderLogs();
  renderGroupedStats(els.chatStats, chatResponse.chatAnalytics, 'user_id', 'request_count');
  renderGroupedStats(els.flashcardStats, flashcardResponse.flashcardAnalytics, 'user_id', 'generated_count');
  renderGroupedStats(els.topicStats, topicsResponse.topics, 'topic', 'count');
}

function init() {
  if (!requireAuth()) {
    return;
  }

  if (els.signedInAs) {
    els.signedInAs.textContent = window.AITutorAPI.getUser()?.email ? `Signed in as ${window.AITutorAPI.getUser().email}` : 'Signed in';
  }

  if (els.logoutButton) {
    els.logoutButton.addEventListener('click', () => {
      clearAuth();
      window.location.href = 'auth.html';
    });
  }

  if (els.refreshButton) {
    els.refreshButton.addEventListener('click', refreshAnalytics);
  }

  refreshAnalytics().catch((error) => {
    if (els.logList) {
      els.logList.innerHTML = `<div class="empty-state">${escapeHtml(error.message)}</div>`;
    }
  });
}

init();
