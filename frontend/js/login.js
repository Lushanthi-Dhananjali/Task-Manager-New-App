const form = document.getElementById('login-form');
const errorEl = document.getElementById('login-error');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorEl.textContent = '';
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value;

  const res = await login(username, password);
  if (res.status === 200 && res.data?.token) {
    setToken(res.data.token);
    window.location.href = 'tasks.html';
  } else {
    errorEl.textContent = res.data?.error || 'Login failed';
  }
});
