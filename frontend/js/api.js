const API_BASE = 'http://localhost:4000/api';

function setToken(token) { localStorage.setItem('jwt', token); }
function getToken() { return localStorage.getItem('jwt'); }
function clearToken() { localStorage.removeItem('jwt'); }

async function apiFetch(path, options = {}) {
  const headers = options.headers || {};
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  headers['Content-Type'] = 'application/json';
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  // if unauthorized, kick to login
  if (res.status === 401) window.location.href = 'login.html';
  // try to parse json; if no body, return null
  const text = await res.text();
  try { return { status: res.status, data: text ? JSON.parse(text) : null }; }
  catch { return { status: res.status, data: text }; }
}

// Auth
async function login(username, password) {
  return apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });
}
async function registerUser(username, password) {
  return apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });
}

// Tasks
async function createTask(title, description = '') {
  return apiFetch('/tasks', {
    method: 'POST',
    body: JSON.stringify({ title, description })
  });
}
async function getTasks() {
  return apiFetch('/tasks', { method: 'GET' });
}
async function updateTask(id, payload) {
  return apiFetch(`/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
}
async function deleteTask(id) {
  return apiFetch(`/tasks/${id}`, { method: 'DELETE' });
}
