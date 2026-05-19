const { requireAuth, clearAuth, get, post, getUser } = window.AITutorAPI;

const state = { prompts: [] };

const els = {
  signedInAs: document.getElementById('signedInAs'),
  refreshButton: document.getElementById('refreshButton'),
  logoutButton: document.getElementById('logoutButton'),
  promptList: document.getElementById('promptList'),
  promptForm: document.getElementById('promptForm'),
  promptService: document.getElementById('promptService'),
  promptText: document.getElementById('promptText'),
  promptStatus: document.getElementById('promptStatus'),
};

function escapeHtml(value) {
  return String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

function renderPrompts() {
  if (!els.promptList) {
    return;
  }

  if (!state.prompts.length) {
    els.promptList.innerHTML = '<div class="empty-state">No prompts stored yet.</div>';
    return;
  }

  els.promptList.innerHTML = state.prompts.map((prompt) => `
    <article class="prompt-item">
      <div class="between">
        <div>
          <strong>${escapeHtml(prompt.service)}</strong>
          <p class="muted">Version ${escapeHtml(String(prompt.version || 1))}</p>
        </div>
        <button class="button secondary" type="button" data-load-prompt="${escapeHtml(prompt.service)}">Edit</button>
      </div>
      <p class="muted" style="margin-top:10px; white-space:pre-wrap;">${escapeHtml(prompt.prompt)}</p>
    </article>
  `).join('');

  els.promptList.querySelectorAll('[data-load-prompt]').forEach((button) => {
    button.addEventListener('click', () => {
      const selected = state.prompts.find((item) => item.service === button.dataset.loadPrompt);
      if (selected && els.promptService && els.promptText) {
        els.promptService.value = selected.service;
        els.promptText.value = selected.prompt;
        if (els.promptStatus) {
          els.promptStatus.textContent = `Editing ${selected.service}`;
        }
      }
    });
  });
}

async function loadPrompts() {
  const response = await get('/api/analytics/prompts');
  state.prompts = response.prompts || [];
  renderPrompts();
}

async function savePrompt(event) {
  event.preventDefault();
  const service = els.promptService?.value.trim();
  const prompt = els.promptText?.value.trim();

  if (!service || !prompt) {
    if (els.promptStatus) {
      els.promptStatus.textContent = 'Service and prompt are required.';
    }
    return;
  }

  if (els.promptStatus) {
    els.promptStatus.textContent = 'Saving prompt...';
  }

  await post(`/api/analytics/prompts/${encodeURIComponent(service)}`, { prompt });
  await loadPrompts();
  if (els.promptStatus) {
    els.promptStatus.textContent = `Saved ${service} prompt.`;
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

  if (els.refreshButton) {
    els.refreshButton.addEventListener('click', loadPrompts);
  }

  if (els.promptForm) {
    els.promptForm.addEventListener('submit', savePrompt);
  }

  loadPrompts().catch((error) => {
    if (els.promptList) {
      els.promptList.innerHTML = `<div class="empty-state">${escapeHtml(error.message)}</div>`;
    }
  });
}

init();
