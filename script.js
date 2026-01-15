let tasks = JSON.parse(localStorage.getItem('zen_tasks')) || [];
let taskToDelete = null;
let taskToEdit = null;

function init() {
    updateHeaderDateTime();
    setInterval(updateHeaderDateTime, 1000);
    render();
    if (localStorage.getItem('zen_theme') === 'dark') toggleTheme();
}

function updateHeaderDateTime() {
    const now = new Date();
    const date = now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const time = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    document.getElementById('dateDisplay').textContent = `${date} • ${time}`;
}

function addTask() {
    const input = document.getElementById('taskInput');
    const priority = document.getElementById('prioritySelect').value;
    if (!input.value.trim()) {
        input.style.borderColor = 'var(--danger)';
        setTimeout(() => (input.style.borderColor = ''), 1000);
        return;
    }
    const now = new Date();
    const newTask = {
        id: Date.now(),
        title: input.value,
        priority,
        done: false,
        date: now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        createdAt: now.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' à ' + now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        updatedAt: null
    };
    tasks.unshift(newTask);
    input.value = '';
    saveAndRender();
}

function toggleTask(id) {
    tasks = tasks.map(t => (t.id === id ? { ...t, done: !t.done } : t));
    saveAndRender();
}

function editTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    taskToEdit = task;
    document.getElementById('editTaskTitle').value = task.title;
    document.getElementById('editPrioritySelect').value = task.priority;
    document.getElementById('editModal').classList.add('show');
    document.getElementById('editTaskTitle').focus();
}

function saveEdit() {
    if (!taskToEdit) return;
    const newTitle = document.getElementById('editTaskTitle').value.trim();
    const newPriority = document.getElementById('editPrioritySelect').value;
    if (!newTitle) {
        alert("Le titre de la tâche ne peut pas être vide.");
        return;
    }
    tasks = tasks.map(t => {
        if (t.id === taskToEdit.id) return { ...t, title: newTitle, priority: newPriority, updatedAt: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) };
        return t;
    });
    closeModal('edit');
    saveAndRender();
}

function deleteTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    taskToDelete = id;
    document.getElementById('deleteModalMessage').textContent = `Êtes-vous sûr de vouloir supprimer la tâche "${task.title}" ? Cette action est irréversible.`;
    document.getElementById('deleteModal').classList.add('show');
}

function confirmDelete() {
    if (taskToDelete !== null) {
        tasks = tasks.filter(t => t.id !== taskToDelete);
        saveAndRender();
        closeModal('delete');
    }
}

function closeModal(type) {
    if (type === 'delete') {
        document.getElementById('deleteModal').classList.remove('show');
        taskToDelete = null;
    }
    if (type === 'edit') {
        document.getElementById('editModal').classList.remove('show');
        taskToEdit = null;
    }
}

function saveAndRender() {
    localStorage.setItem('zen_tasks', JSON.stringify(tasks));
    render();
}

function updateProgress() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.done).length;
    const pending = total - completed;
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
    const circle = document.getElementById('progressPath');
    circle.style.strokeDashoffset = 220 - (220 * percent) / 100;
    document.getElementById('progressPercent').textContent = `${percent}%`;
    document.getElementById('progressStats').textContent = `${completed}/${total} tâches`;
    document.getElementById('totalTasks').textContent = total;
    document.getElementById('completedTasks').textContent = completed;
    document.getElementById('pendingTasks').textContent = pending;
    circle.style.stroke = percent === 100 ? 'var(--success)' : percent >= 50 ? 'var(--primary)' : percent > 0 ? 'var(--warning)' : 'var(--primary)';
}

function render() {
    const list = document.getElementById('taskList');
    list.innerHTML = '';
    tasks.forEach(task => {
        const item = document.createElement('div');
        item.className = `task-item ${task.done ? 'done' : ''} priority-${task.priority}`;
        const timeInfo = task.updatedAt ? `<span class="task-meta"><i class="fas fa-history"></i> Modifié à ${task.updatedAt}</span>` : `<span class="task-meta"><i class="far fa-clock"></i> Créé le ${task.createdAt}</span>`;
        item.innerHTML = `
            <div class="checkbox-custom" onclick="toggleTask(${task.id})">${task.done ? '<i class="fas fa-check"></i>' : ''}</div>
            <div class="task-content"><span class="task-title">${task.title}</span>${timeInfo}</div>
            <div class="task-actions"><button class="btn-action btn-edit" onclick="editTask(${task.id})"><i class="fas fa-edit"></i></button><button class="btn-action btn-delete" onclick="deleteTask(${task.id})"><i class="fas fa-trash-alt"></i></button></div>
        `;
        list.appendChild(item);
    });
    updateProgress();
}

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const icon = document.querySelector('.theme-switch i');
    const isDark = document.body.classList.contains('dark-mode');
    icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    localStorage.setItem('zen_theme', isDark ? 'dark' : 'light');
}

document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', e => {
        if (e.target === modal) {
            if (modal.id === 'deleteModal') closeModal('delete');
            if (modal.id === 'editModal') closeModal('edit');
        }
    });
});

document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        closeModal('delete');
        closeModal('edit');
    }
});

document.getElementById('taskInput').addEventListener('keypress', e => {
    if (e.key === 'Enter') addTask();
});

init();
