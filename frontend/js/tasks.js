const listEl = document.getElementById('task-list');
const titleEl = document.getElementById('task-title');
const descEl = document.getElementById('task-desc');
const addBtn = document.getElementById('btn-add');
const addErr = document.getElementById('add-error');

document.getElementById('btn-logout').addEventListener('click', () => {
  clearToken();
  window.location.href = 'login.html';
});

function taskItemTemplate(task) {
  const li = document.createElement('li');
  li.setAttribute('data-id', task._id);

  // VIEW MODE
  const title = document.createElement('span');
  title.textContent = task.title + (task.done ? ' ✅' : '');
  title.className = 'task-title';

  const btnToggle = document.createElement('button');
  btnToggle.textContent = task.done ? 'Mark Undone' : 'Mark Done';
  btnToggle.className = 'btn-toggle';
  btnToggle.setAttribute('data-test', 'toggle-done');

  const btnEdit = document.createElement('button');
  btnEdit.textContent = 'Edit';
  btnEdit.className = 'btn-edit';
  btnEdit.setAttribute('data-test', 'edit-task');

  const btnDelete = document.createElement('button');
  btnDelete.textContent = 'Delete';
  btnDelete.className = 'btn-delete';
  btnDelete.setAttribute('data-test', 'delete-task');

  // EDIT MODE (hidden by default)
  const wrapEdit = document.createElement('div');
  wrapEdit.style.display = 'none';
  wrapEdit.style.gridColumn = '1 / -1'; // span full row
  wrapEdit.className = 'edit-wrap';

  const inputTitle = document.createElement('input');
  inputTitle.type = 'text';
  inputTitle.value = task.title;
  inputTitle.placeholder = 'Task title';
  inputTitle.setAttribute('data-test', 'edit-title');

  const inputDesc = document.createElement('input');
  inputDesc.type = 'text';
  inputDesc.value = task.description || '';
  inputDesc.placeholder = 'Description (optional)';
  inputDesc.setAttribute('data-test', 'edit-desc');

  const btnSave = document.createElement('button');
  btnSave.textContent = 'Save';
  btnSave.className = 'btn-save';
  btnSave.setAttribute('data-test', 'save-task');

  const btnCancel = document.createElement('button');
  btnCancel.textContent = 'Cancel';
  btnCancel.className = 'secondary';
  btnCancel.setAttribute('data-test', 'cancel-edit');

  // layout for edit area
  wrapEdit.appendChild(inputTitle);
  wrapEdit.appendChild(inputDesc);
  wrapEdit.appendChild(btnSave);
  wrapEdit.appendChild(btnCancel);

  // ----- event handlers -----
  btnToggle.addEventListener('click', async () => {
    const updated = await updateTask(task._id, { ...task, done: !task.done });
    if (updated.status === 200) renderTasks();
  });

  btnDelete.addEventListener('click', async () => {
    const res = await deleteTask(task._id);
    if (res.status === 204) renderTasks();
  });

  btnEdit.addEventListener('click', () => {
    // switch to edit mode
    title.style.display = 'none';
    btnToggle.style.display = 'none';
    btnEdit.style.display = 'none';
    btnDelete.style.display = 'none';
    wrapEdit.style.display = 'grid';
    inputTitle.focus();
  });

  btnCancel.addEventListener('click', () => {
    // back to view mode
    wrapEdit.style.display = 'none';
    title.style.display = '';
    btnToggle.style.display = '';
    btnEdit.style.display = '';
    btnDelete.style.display = '';
  });

  btnSave.addEventListener('click', async () => {
    const newTitle = inputTitle.value.trim();
    const newDesc = inputDesc.value.trim();
    if (!newTitle) {
      alert('Title is required');
      inputTitle.focus();
      return;
    }
    const payload = { ...task, title: newTitle, description: newDesc };
    const res = await updateTask(task._id, payload);
    if (res.status === 200) renderTasks();
    else alert(res.data?.error || 'Failed to update');
  });

  // assemble list item
  li.appendChild(title);
  li.appendChild(btnToggle);
  li.appendChild(btnEdit);
  li.appendChild(btnDelete);
  li.appendChild(wrapEdit);

  return li;
}

async function renderTasks() {
  listEl.innerHTML = '';
  const res = await getTasks();
  if (res.status === 200 && Array.isArray(res.data)) {
    res.data.forEach(t => listEl.appendChild(taskItemTemplate(t)));
  } else if (res.status === 401) {
    // redirected by apiFetch; do nothing
  } else {
    listEl.innerHTML = '<li>Failed to load tasks</li>';
  }
}

addBtn.addEventListener('click', async () => {
  addErr.textContent = '';
  const title = titleEl.value.trim();
  const description = descEl.value.trim();
  if (!title) { addErr.textContent = 'Title is required'; return; }
  const res = await createTask(title, description);
  if (res.status === 201) {
    titleEl.value = ''; descEl.value = '';
    await renderTasks();
  } else {
    addErr.textContent = res.data?.error || 'Failed to add';
  }
});

// initial load
if (!getToken()) window.location.href = 'login.html';
else renderTasks();
