const { requireAuth, clearAuth, get } = window.AITutorAPI;

const state = { users: [] };

const els = {
  signedInAs: document.getElementById('signedInAs'),
  refreshButton: document.getElementById('refreshButton'),
  logoutButton: document.getElementById('logoutButton'),
  usersBody: document.getElementById('usersBody'),
  usersEmpty: document.getElementById('usersEmpty'),
  usersStatus: document.getElementById('usersStatus'),
  activityLog: document.getElementById('activityLog'),
};

function escapeHtml(value) {
  return String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
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
      <td>${escapeHtml(user.role || 'user')}</td>
      <td>${escapeHtml(user.createdAt || user.created_at || '-')}</td>
    </tr>
  `).join('');
}

function renderActivity(message) {
  if (!els.activityLog) {
    return;
  }

  els.activityLog.innerHTML = `<article class="log-item"><strong>${escapeHtml(message)}</strong></article>`;
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
    els.usersStatus.textContent = error.status === 404 ? 'Users endpoint is not implemented yet.' : `Users unavailable: ${error.message}`;
  }

  renderUsers();
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
    els.refreshButton.addEventListener('click', loadUsers);
  }

  loadUsers();
  renderActivity('User directory loaded.');
}

init();
