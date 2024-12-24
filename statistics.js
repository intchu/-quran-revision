class StatisticsTracker {
    constructor() {
        this.revisions = JSON.parse(localStorage.getItem('revisions')) || [];
        this.updateStatistics();
        this.createSurahProgress();
    }

    updateStatistics() {
        // Calcul du nombre total de versets mémorisés
        const totalVerses = this.revisions.reduce((total, rev) => 
            total + (rev.versetFin - rev.versetDebut + 1), 0);
        document.getElementById('totalVerses').textContent = totalVerses;

        // Calcul du nombre de révisions complétées
        const completedRevisions = this.revisions.reduce((total, rev) => 
            total + rev.revisions.filter(r => r.completed).length, 0);
        document.getElementById('completedRevisions').textContent = completedRevisions;

        // Calcul des révisions à venir
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const upcomingRevisions = this.revisions.reduce((total, rev) => {
            return total + rev.revisions.filter(r => {
                const revDate = new Date(r.date);
                return revDate >= today && !r.completed;
            }).length;
        }, 0);
        document.getElementById('upcomingRevisions').textContent = upcomingRevisions;

        // Calcul du taux de complétion
        const totalRevisions = this.revisions.reduce((total, rev) => 
            total + rev.revisions.length, 0);
        const completionRate = totalRevisions > 0 
            ? Math.round((completedRevisions / totalRevisions) * 100) 
            : 0;
        document.getElementById('completionRate').textContent = `${completionRate}%`;
    }

    createSurahProgress() {
        const surahProgress = document.getElementById('surahProgress');
        const surahStats = this.calculateSurahProgress();

        // Trier les sourates par numéro
        const sortedSurahs = Object.entries(surahStats)
            .sort(([a], [b]) => parseInt(a) - parseInt(b));

        sortedSurahs.forEach(([surahId, stats]) => {
            const surah = SURAHS.find(s => s.id === parseInt(surahId));
            if (!surah) return;

            const progressPercentage = Math.round((stats.memorizedVerses / surah.versesCount) * 100);
            
            const surahItem = document.createElement('div');
            surahItem.className = 'surah-item';
            surahItem.innerHTML = `
                <div class="surah-name">${surah.id}. ${surah.name}</div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progressPercentage}%"></div>
                </div>
                <div class="progress-text">${stats.memorizedVerses}/${surah.versesCount} versets (${progressPercentage}%)</div>
            `;
            
            surahProgress.appendChild(surahItem);
        });
    }

    calculateSurahProgress() {
        const surahStats = {};

        this.revisions.forEach(rev => {
            if (!surahStats[rev.surahId]) {
                surahStats[rev.surahId] = {
                    memorizedVerses: 0
                };
            }
            surahStats[rev.surahId].memorizedVerses += 
                (rev.versetFin - rev.versetDebut + 1);
        });

        return surahStats;
    }
}

// Initialiser le suivi des statistiques
const statisticsTracker = new StatisticsTracker();
