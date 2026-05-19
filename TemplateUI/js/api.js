const API_BASE_URL = 'http://localhost:5000';
const TOKEN_KEY = 'aiTutor.jwt';
const USER_KEY = 'aiTutor.user';

function getToken() {
  return localStorage.getItem(TOKEN_KEY) || '';
}

function setToken(token, user = null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }

  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else if (!token) {
    localStorage.removeItem(USER_KEY);
  }
}

function getUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_error) {
    return null;
  }
}

function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

function isLoggedIn() {
  return Boolean(getToken());
}

function redirectToLogin() {
  if (!window.location.pathname.endsWith('/auth.html')) {
    window.location.href = 'auth.html';
  }
}

function serializeBody(body) {
  if (body === undefined || body === null) {
    return undefined;
  }

  if (typeof body === 'string' || body instanceof FormData || body instanceof Blob) {
    return body;
  }

  return JSON.stringify(body);
}

async function parseResponse(response) {
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return response.json();
  }

  const text = await response.text();
  return text ? { message: text } : {};
}

async function request(path, options = {}) {
  const {
    method = 'GET',
    body,
    headers = {},
    auth = true,
    baseUrl = API_BASE_URL,
  } = options;

  const finalHeaders = { ...headers };
  if (auth) {
    const token = getToken();
    if (token) {
      finalHeaders.Authorization = `Bearer ${token}`;
    }
  }

  const payload = serializeBody(body);
  if (payload && !(payload instanceof FormData) && !(payload instanceof Blob)) {
    finalHeaders['Content-Type'] = finalHeaders['Content-Type'] || 'application/json';
  }

  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: finalHeaders,
    body: payload,
  });

  if (response.status === 401) {
    clearAuth();
    redirectToLogin();
    throw new Error('Unauthorized');
  }

  const data = await parseResponse(response);
  if (!response.ok) {
    const error = new Error(data.message || data.error || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

function get(path, options = {}) {
  return request(path, { ...options, method: 'GET' });
}

function post(path, body, options = {}) {
  return request(path, { ...options, method: 'POST', body });
}

function requireAuth() {
  if (!isLoggedIn()) {
    redirectToLogin();
    return false;
  }

  return true;
}

window.AITutorAPI = {
  API_BASE_URL,
  getToken,
  setToken,
  getUser,
  clearAuth,
  isLoggedIn,
  requireAuth,
  request,
  get,
  post,
};
