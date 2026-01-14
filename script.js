   let tasks = JSON.parse(localStorage.getItem('zen_tasks')) || [];
        let taskToDelete = null;
        let taskToEdit = null;

        function init() {
            const now = new Date();
            document.getElementById('dateDisplay').textContent = now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
            render();
            
            // Appliquer le thème sauvegardé
            if(localStorage.getItem('zen_theme') === 'dark') toggleTheme();
        }

        function addTask() {
            const input = document.getElementById('taskInput');
            const priority = document.getElementById('prioritySelect').value;
            
            if (!input.value.trim()) {
                input.style.borderColor = 'var(--danger)';
                setTimeout(() => input.style.borderColor = '', 1000);
                return;
            }

            const newTask = {
                id: Date.now(),
                title: input.value,
                priority: priority,
                done: false,
                date: new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'}),
                updatedAt: null
            };

            tasks.unshift(newTask);
            input.value = '';
            saveAndRender();
        }

        function toggleTask(id) {
            tasks = tasks.map(t => t.id === id ? {...t, done: !t.done} : t);
            saveAndRender();
        }

        function editTask(id) {
            const task = tasks.find(t => t.id === id);
            if (!task) return;
            
            taskToEdit = task;
            
            // Remplir le formulaire d'édition
            document.getElementById('editTaskTitle').value = task.title;
            document.getElementById('editPrioritySelect').value = task.priority;
            
            // Afficher le modal d'édition
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
                if (t.id === taskToEdit.id) {
                    return {
                        ...t,
                        title: newTitle,
                        priority: newPriority,
                        updatedAt: new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})
                    };
                }
                return t;
            });
            
            closeModal('edit');
            saveAndRender();
        }

        function deleteTask(id) {
            const task = tasks.find(t => t.id === id);
            if (!task) return;
            
            taskToDelete = id;
            
            // Mettre à jour le message du modal
            document.getElementById('deleteModalMessage').textContent = 
                `Êtes-vous sûr de vouloir supprimer la tâche "${task.title}" ? Cette action est irréversible.`;
            
            // Afficher le modal de suppression
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
            } else if (type === 'edit') {
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
            
            // Mettre à jour le cercle de progression
            const circle = document.getElementById('progressPath');
            const offset = 220 - (220 * percent / 100);
            circle.style.strokeDashoffset = offset;
            
            // Mettre à jour le texte dans le cercle
            document.getElementById('progressPercent').textContent = `${percent}%`;
            document.getElementById('progressStats').textContent = `${completed}/${total} tâches`;
            
            // Mettre à jour les statistiques détaillées
            document.getElementById('totalTasks').textContent = total;
            document.getElementById('completedTasks').textContent = completed;
            document.getElementById('pendingTasks').textContent = pending;
            
            // Changer la couleur du cercle selon le pourcentage
            if (percent === 100) {
                circle.style.stroke = 'var(--success)';
            } else if (percent >= 50) {
                circle.style.stroke = 'var(--primary)';
            } else if (percent > 0) {
                circle.style.stroke = 'var(--warning)';
            } else {
                circle.style.stroke = 'var(--primary)';
            }
        }

        function render() {
            const list = document.getElementById('taskList');
            list.innerHTML = '';

            tasks.forEach(task => {
                const item = document.createElement('div');
                item.className = `task-item ${task.done ? 'done' : ''} priority-${task.priority}`;
                
                const timeInfo = task.updatedAt 
                    ? `<span class="task-meta"><i class="fas fa-history"></i> Modifié à ${task.updatedAt}</span>`
                    : `<span class="task-meta"><i class="far fa-clock"></i> Créé à ${task.date}</span>`;
                
                item.innerHTML = `
                    <div class="checkbox-custom" onclick="toggleTask(${task.id})">
                        ${task.done ? '<i class="fas fa-check"></i>' : ''}
                    </div>
                    <div class="task-content">
                        <span class="task-title">${task.title}</span>
                        ${timeInfo}
                    </div>
                    <div class="task-actions">
                        <button class="btn-action btn-edit" onclick="editTask(${task.id})" title="Modifier">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-action btn-delete" onclick="deleteTask(${task.id})" title="Supprimer">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
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

        // Fermer les modals en cliquant en dehors
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.addEventListener('click', function(e) {
                if (e.target === this) {
                    const modalId = this.id;
                    if (modalId === 'deleteModal') closeModal('delete');
                    if (modalId === 'editModal') closeModal('edit');
                }
            });
        });

        // Fermer les modals avec la touche Échap
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                if (document.getElementById('deleteModal').classList.contains('show')) {
                    closeModal('delete');
                }
                if (document.getElementById('editModal').classList.contains('show')) {
                    closeModal('edit');
                }
            }
        });

        // Permettre d'ajouter une tâche avec Entrée
        document.getElementById('taskInput').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                addTask();
            }
        });

        init();