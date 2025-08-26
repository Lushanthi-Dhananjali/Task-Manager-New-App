const regForm = document.getElementById('register-form');
const regErr = document.getElementById('register-error');

regForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  regErr.textContent = '';
  const username = document.getElementById('reg-username').value.trim();
  const password = document.getElementById('reg-password').value;

  const res = await registerUser(username, password);
  if (res.status === 201) {
    // optional: auto-login
    const loginRes = await login(username, password);
    if (loginRes.status === 200) {
      setToken(loginRes.data.token);
      window.location.href = 'tasks.html';
    } else {
      window.location.href = 'login.html';
    }
  } else {
    regErr.textContent = res.data?.error || 'Registration failed';
  }
});
