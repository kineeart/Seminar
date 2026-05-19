const {
  getToken,
  setToken,
  clearAuth,
  post,
} = window.AITutorAPI;

const form = document.getElementById('authForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const modeTabs = Array.from(document.querySelectorAll('[data-mode]'));
const nameField = document.getElementById('nameField');
const nameInput = document.getElementById('name');
const submitButton = document.getElementById('submitButton');
const statusBox = document.getElementById('statusBox');
const subtitle = document.getElementById('authSubtitle');

let mode = 'login';

function setStatus(message, tone = 'info') {
  statusBox.hidden = !message;
  statusBox.textContent = message || '';
  statusBox.dataset.tone = tone;
}

function updateMode(nextMode) {
  mode = nextMode;
  modeTabs.forEach((tab) => {
    tab.classList.toggle('active', tab.dataset.mode === mode);
  });
  nameField.hidden = mode !== 'signup';
  submitButton.textContent = mode === 'signup' ? 'Create admin account' : 'Login to dashboard';
  subtitle.textContent = mode === 'signup'
    ? 'Create a local admin account for the thesis demo.'
    : 'Sign in to the AI Tutor admin dashboard.';
  setStatus('');
}

async function handleSubmit(event) {
  event.preventDefault();
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    setStatus('Email and password are required.', 'error');
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = mode === 'signup' ? 'Creating...' : 'Signing in...';

  try {
    if (mode === 'signup') {
      await post('/api/auth/signup', {
        email,
        password,
        name: nameInput.value.trim(),
      }, { auth: false });
      setStatus('Account created. Logging you in...', 'success');
    }

    const loginResponse = await post('/api/auth/login', { email, password }, { auth: false });
    setToken(loginResponse.token, loginResponse.user || { email });
    window.location.href = 'admin.html';
  } catch (error) {
    setStatus(error.message || 'Login failed.', 'error');
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = mode === 'signup' ? 'Create admin account' : 'Login to dashboard';
  }
}

function boot() {
  if (getToken()) {
    window.location.href = 'admin.html';
    return;
  }

  clearAuth();
  updateMode('login');
  modeTabs.forEach((tab) => tab.addEventListener('click', () => updateMode(tab.dataset.mode)));
  form.addEventListener('submit', handleSubmit);
}

boot();
