class WeekPlanning {
    constructor() {
        this.revisions = JSON.parse(localStorage.getItem('revisions')) || [];
        this.initializeWeekView();
    }

    initializeWeekView() {
        const today = new Date();
        const currentDay = today.getDay();
        const mondayDiff = currentDay === 0 ? -6 : 1 - currentDay;
        
        const monday = new Date(today);
        monday.setDate(today.getDate() + mondayDiff);
        monday.setHours(0, 0, 0, 0);

        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);

        // Mettre à jour le titre de la semaine
        document.getElementById('weekRange').textContent = `${monday.toLocaleDateString()} au ${sunday.toLocaleDateString()}`;

        const weekGrid = document.getElementById('weekGrid');
        weekGrid.innerHTML = '';

        // Créer les cartes pour chaque jour
        for (let i = 0; i < 7; i++) {
            const currentDate = new Date(monday);
            currentDate.setDate(monday.getDate() + i);
            
            const dayCard = this.createDayCard(currentDate);
            weekGrid.appendChild(dayCard);
        }
    }

    createDayCard(date) {
        const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
        const isToday = this.isToday(date);
        
        const card = document.createElement('div');
        card.className = 'day-card' + (isToday ? ' today' : '');
        
        const header = document.createElement('div');
        header.className = 'day-header';
        header.innerHTML = `
            <div class="day-name">${dayNames[date.getDay()]}</div>
            <div class="day-date">${date.toLocaleDateString()}</div>
        `;
        
        const tasks = document.createElement('div');
        tasks.className = 'day-tasks';
        
        // Trouver les révisions pour ce jour
        const dayTasks = this.getRevisionsForDate(date);
        dayTasks.forEach(task => {
            const taskElement = document.createElement('div');
            taskElement.className = 'day-task' + (isToday ? ' today' : '');
            taskElement.innerHTML = `
                <div class="task-content">
                    <div>${task.surahName}</div>
                    <div>Versets ${task.versetDebut}-${task.versetFin}</div>
                    <div>${task.type === 'memorization' ? 'Mémorisation' : 'Révision J+' + task.jour}</div>
                </div>
                <button class="delete-task-btn" onclick="weekPlanning.showDeleteConfirmation('${task.dateInitiale}')">
                    <i class="fas fa-trash-alt"></i>
                </button>
            `;
            tasks.appendChild(taskElement);
        });
        
        card.appendChild(header);
        card.appendChild(tasks);
        return card;
    }

    getRevisionsForDate(date) {
        const tasks = [];
        const dateStr = date.toISOString().split('T')[0];
        
        this.revisions.forEach(rev => {
            rev.revisions.forEach(r => {
                const revDate = new Date(r.date);
                if (revDate.toISOString().split('T')[0] === dateStr && !r.completed) {
                    tasks.push({
                        surahName: rev.surahName,
                        versetDebut: rev.versetDebut,
                        versetFin: rev.versetFin,
                        type: r.jour === 0 ? 'memorization' : 'revision',
                        jour: r.jour,
                        dateInitiale: rev.dateInitiale
                    });
                }
            });
        });
        
        return tasks;
    }

    isToday(date) {
        const today = new Date();
        return date.getDate() === today.getDate() &&
               date.getMonth() === today.getMonth() &&
               date.getFullYear() === today.getFullYear();
    }

    showDeleteConfirmation(dateInitiale) {
        const revision = this.revisions.find(r => r.dateInitiale === dateInitiale);
        if (!revision) return;

        const overlay = document.createElement('div');
        overlay.className = 'confirmation-overlay';
        
        const dialog = document.createElement('div');
        dialog.className = 'confirmation-dialog';
        
        dialog.innerHTML = `
            <h3>Confirmer la suppression</h3>
            <p>Êtes-vous sûr de vouloir supprimer la mémorisation de ${revision.surahName}, versets ${revision.versetDebut} à ${revision.versetFin} ?</p>
            <div class="confirmation-buttons">
                <button class="cancel-delete" onclick="weekPlanning.closeDeleteConfirmation()">Annuler</button>
                <button class="confirm-delete" onclick="weekPlanning.deleteRevision('${dateInitiale}')">Supprimer</button>
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

    deleteRevision(dateInitiale) {
        this.revisions = this.revisions.filter(r => r.dateInitiale !== dateInitiale);
        localStorage.setItem('revisions', JSON.stringify(this.revisions));
        this.initializeWeekView();
        this.closeDeleteConfirmation();
    }
}

// Initialiser le planning de la semaine
const weekPlanning = new WeekPlanning();
