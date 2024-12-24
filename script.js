class RevisionTracker {
    constructor() {
        this.revisions = JSON.parse(localStorage.getItem('revisions')) || [];
        this.initializeEventListeners();
        this.populateSurahSelect();
        this.setDefaultDate();
        this.updateRevisionsList();
    }

    setDefaultDate() {
        const today = new Date();
        const dateInput = document.getElementById('dateApprentissage');
        dateInput.value = today.toISOString().split('T')[0];
    }

    initializeEventListeners() {
        document.getElementById('verseForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addNewVerse();
        });

        document.getElementById('sourate').addEventListener('change', (e) => {
            this.updateVerseSelects(e.target.value);
        });

        document.getElementById('versetDebut').addEventListener('change', (e) => {
            this.updateVersetFin(e.target.value);
        });
    }

    populateSurahSelect() {
        const select = document.getElementById('sourate');
        SURAHS.forEach(surah => {
            const option = document.createElement('option');
            option.value = surah.id;
            option.textContent = `${surah.id}. ${surah.name} (${surah.versesCount} versets)`;
            select.appendChild(option);
        });
    }

    updateVerseSelects(surahId) {
        const selectDebut = document.getElementById('versetDebut');
        const selectFin = document.getElementById('versetFin');
        
        selectDebut.innerHTML = '<option value="">-</option>';
        selectFin.innerHTML = '<option value="">-</option>';
        
        if (!surahId) return;

        const surah = SURAHS.find(s => s.id === parseInt(surahId));
        if (surah) {
            for (let i = 1; i <= surah.versesCount; i++) {
                const option = document.createElement('option');
                option.value = i;
                option.textContent = i;
                selectDebut.appendChild(option.cloneNode(true));
            }
        }
    }

    updateVersetFin(versetDebut) {
        const selectFin = document.getElementById('versetFin');
        const surahId = document.getElementById('sourate').value;
        
        selectFin.innerHTML = '<option value="">-</option>';
        
        if (!versetDebut || !surahId) return;

        const surah = SURAHS.find(s => s.id === parseInt(surahId));
        if (surah) {
            for (let i = parseInt(versetDebut); i <= surah.versesCount; i++) {
                const option = document.createElement('option');
                option.value = i;
                option.textContent = i;
                selectFin.appendChild(option);
            }
        }
    }

    addNewVerse() {
        const surahId = parseInt(document.getElementById('sourate').value);
        const versetDebut = parseInt(document.getElementById('versetDebut').value);
        const versetFin = parseInt(document.getElementById('versetFin').value);
        const dateApprentissage = new Date(document.getElementById('dateApprentissage').value);

        const surah = SURAHS.find(s => s.id === surahId);
        if (!surah) return;

        const newRevision = {
            surahId: surahId,
            surahName: surah.name,
            versetDebut: versetDebut,
            versetFin: versetFin,
            dateInitiale: dateApprentissage.toISOString(),
            dateApprentissage: dateApprentissage.toISOString(),
            revisions: [
                { jour: 0, date: dateApprentissage.toISOString(), completed: false },
                { jour: 1, date: this.addDays(dateApprentissage, 1), completed: false },
                { jour: 3, date: this.addDays(dateApprentissage, 3), completed: false },
                { jour: 7, date: this.addDays(dateApprentissage, 7), completed: false },
                { jour: 15, date: this.addDays(dateApprentissage, 15), completed: false },
                { jour: 30, date: this.addDays(dateApprentissage, 30), completed: false }
            ]
        };

        this.revisions.push(newRevision);
        this.saveToLocalStorage();
        this.updateRevisionsList();
        
        document.getElementById('verseForm').reset();
        document.getElementById('versetDebut').innerHTML = '<option value="">-</option>';
        document.getElementById('versetFin').innerHTML = '<option value="">-</option>';
        this.setDefaultDate();
    }

    addDays(date, days) {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result.toISOString();
    }

    updateRevisionsList() {
        const revisionsList = document.getElementById('revisionsList');
        revisionsList.innerHTML = '';
        
        this.revisions.sort((a, b) => new Date(a.dateApprentissage) - new Date(b.dateApprentissage))
            .forEach(revision => {
                const revisionGroup = this.createRevisionGroup(revision);
                revisionsList.appendChild(revisionGroup);
            });
    }

    isInCurrentWeek(date) {
        const today = new Date();
        const startOfWeek = new Date(today);
        const endOfWeek = new Date(today);
        
        // Ajuster au début de la semaine (Lundi)
        const currentDay = today.getDay();
        const mondayDiff = currentDay === 0 ? -6 : 1 - currentDay;
        startOfWeek.setDate(today.getDate() + mondayDiff);
        startOfWeek.setHours(0, 0, 0, 0);
        
        // Ajuster à la fin de la semaine (Dimanche)
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
        
        return date >= startOfWeek && date <= endOfWeek;
    }

    isToday(date) {
        const today = new Date();
        return date.getDate() === today.getDate() &&
               date.getMonth() === today.getMonth() &&
               date.getFullYear() === today.getFullYear();
    }

    createRevisionGroup(revision) {
        const div = document.createElement('div');
        div.className = 'revision-group';
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const header = document.createElement('div');
        header.className = 'revision-header';
        header.innerHTML = `
            <div class="revision-title-section">
                <span class="revision-title">${revision.surahName}</span>
                <span class="revision-date">Mémorisation: ${new Date(revision.dateApprentissage).toLocaleDateString()}</span>
            </div>
            <button class="delete-btn" onclick="revisionTracker.showDeleteConfirmation('${revision.dateInitiale}')">
                <i class="fas fa-trash"></i>
            </button>
        `;

        const content = document.createElement('div');
        content.className = 'revision-content';
        content.innerHTML = `
            <p class="revision-verses">Versets ${revision.versetDebut} à ${revision.versetFin}</p>
            <div class="revision-schedule">
                ${revision.revisions.map(rev => {
                    const revDate = new Date(rev.date);
                    const isPast = revDate < today;
                    const isToday = this.isToday(revDate);
                    const isCurrentWeek = this.isInCurrentWeek(revDate);
                    
                    let status = rev.completed ? 'completed' : '';
                    if (!rev.completed) {
                        if (isToday) status = 'today';
                        else if (isCurrentWeek) status = 'current-week';
                    }

                    let notificationContent = '';
                    if (isToday && !rev.completed && rev.jour > 0) {
                        notificationContent = `
                            <div class="revision-notification reminder">📅 Rappel : C'est aujourd'hui !</div>
                            <div class="revision-notification">🎯 Révision J+${rev.jour} à faire</div>
                        `;
                    }
                    
                    return `
                        <div class="revision-step ${status}">
                            <div class="step-header">
                                <span class="step-day">J+${rev.jour}</span>
                                <span class="step-date ${isCurrentWeek && !rev.completed ? 'current-week' : ''}">${revDate.toLocaleDateString()}</span>
                            </div>
                            ${notificationContent}
                            ${!rev.completed && (isToday || isPast) ? `
                                <button class="${rev.jour === 0 ? '' : 'mark-revised'}" onclick="revisionTracker.markAsCompleted('${revision.dateInitiale}', ${revision.revisions.indexOf(rev)})">
                                    ${rev.jour === 0 ? 'Marquer comme appris' : 'Marquer comme révisé'}
                                </button>
                            ` : ''}
                            ${rev.completed ? '<span class="revision-status completed">Complété ✓</span>' : ''}
                        </div>
                    `;
                }).join('')}
            </div>
        `;

        div.appendChild(header);
        div.appendChild(content);
        return div;
    }

    markAsCompleted(dateInitiale, revisionIndex) {
        const revision = this.revisions.find(r => r.dateInitiale === dateInitiale);
        if (revision) {
            revision.revisions[revisionIndex].completed = true;
            this.saveToLocalStorage();
            this.updateRevisionsList();
        }
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
                <button class="cancel-delete" onclick="revisionTracker.closeDeleteConfirmation()">Annuler</button>
                <button class="confirm-delete" onclick="revisionTracker.deleteRevision('${dateInitiale}')">Supprimer</button>
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
        this.saveToLocalStorage();
        this.updateRevisionsList();
        this.closeDeleteConfirmation();
    }

    saveToLocalStorage() {
        localStorage.setItem('revisions', JSON.stringify(this.revisions));
    }
}

// Initialiser l'application
const revisionTracker = new RevisionTracker();
