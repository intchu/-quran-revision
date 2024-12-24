class CompletedTasks {
    constructor() {
        this.revisions = JSON.parse(localStorage.getItem('revisions')) || [];
        this.currentFilter = 'all';
        this.initializeFilters();
        this.updateCompletedList();
    }

    initializeFilters() {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.filter;
                this.updateCompletedList();
            });
        });
    }

    updateCompletedList() {
        const completedList = document.getElementById('completedList');
        completedList.innerHTML = '';
        
        const completedTasks = this.getCompletedTasks();
        
        completedTasks.forEach(task => {
            if (this.currentFilter === 'all' || 
                (this.currentFilter === 'memorized' && task.jour === 0) ||
                (this.currentFilter === 'revised' && task.jour > 0)) {
                
                const taskElement = document.createElement('div');
                taskElement.className = 'completed-item';
                taskElement.innerHTML = `
                    <div class="completed-info">
                        <div class="completed-title">${task.surahName}</div>
                        <div class="completed-details">Versets ${task.versetDebut}-${task.versetFin}</div>
                    </div>
                    <div class="completed-date">${new Date(task.completedDate).toLocaleDateString()}</div>
                    <div class="completed-type ${task.jour === 0 ? 'memorized' : 'revised'}">
                        ${task.jour === 0 ? 'Mémorisé' : 'Révisé J+' + task.jour}
                    </div>
                    <button class="delete-task-btn" onclick="completedTasks.showDeleteConfirmation('${task.dateInitiale}', '${task.completedDate}')">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                `;
                
                completedList.appendChild(taskElement);
            }
        });
    }

    getCompletedTasks() {
        const tasks = [];
        
        this.revisions.forEach(rev => {
            rev.revisions.forEach(r => {
                if (r.completed) {
                    tasks.push({
                        surahName: rev.surahName,
                        versetDebut: rev.versetDebut,
                        versetFin: rev.versetFin,
                        jour: r.jour,
                        completedDate: r.completedDate || r.date,
                        dateInitiale: rev.dateInitiale
                    });
                }
            });
        });
        
        // Trier par date de complétion (plus récent en premier)
        return tasks.sort((a, b) => new Date(b.completedDate) - new Date(a.completedDate));
    }

    showDeleteConfirmation(dateInitiale, completedDate) {
        const revision = this.revisions.find(r => r.dateInitiale === dateInitiale);
        if (!revision) return;

        const overlay = document.createElement('div');
        overlay.className = 'confirmation-overlay';
        
        const dialog = document.createElement('div');
        dialog.className = 'confirmation-dialog';
        
        dialog.innerHTML = `
            <h3>Confirmer la suppression</h3>
            <p>Êtes-vous sûr de vouloir supprimer cette tâche complétée de ${revision.surahName}, versets ${revision.versetDebut} à ${revision.versetFin} ?</p>
            <div class="confirmation-buttons">
                <button class="cancel-delete" onclick="completedTasks.closeDeleteConfirmation()">Annuler</button>
                <button class="confirm-delete" onclick="completedTasks.deleteRevision('${dateInitiale}', '${completedDate}')">Supprimer</button>
            </div>
        `;
        
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);
    }

    closeDeleteConfirmation() {
        const overlay = document.querySelector('.confirmation-overlay');
        if (overlay) {
            overlay.remove();
        }
    }

    deleteRevision(dateInitiale, completedDate) {
        const revisionIndex = this.revisions.findIndex(r => r.dateInitiale === dateInitiale);
        if (revisionIndex === -1) return;

        const revision = this.revisions[revisionIndex];
        const revisionToDelete = revision.revisions.findIndex(r => 
            new Date(r.completedDate).getTime() === new Date(completedDate).getTime()
        );

        if (revisionToDelete !== -1) {
            revision.revisions[revisionToDelete].completed = false;
            delete revision.revisions[revisionToDelete].completedDate;
            
            if (revision.revisions.every(r => !r.completed)) {
                this.revisions.splice(revisionIndex, 1);
            }
            
            localStorage.setItem('revisions', JSON.stringify(this.revisions));
            this.updateCompletedList();
        }
        
        this.closeDeleteConfirmation();
    }
}

// Initialiser la liste des tâches terminées
const completedTasks = new CompletedTasks();
