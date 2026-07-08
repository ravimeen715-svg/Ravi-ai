// ==========================================
// Dashboard Module
// ==========================================

const DashboardModule = {
    init() {
        this.updateStats();
        this.renderRecentProjects();
        this.bindQuickActions();
    },

    updateStats() {
        const stats = Storage.getStats();
        document.getElementById('totalVideos').textContent = stats.totalVideos;
        document.getElementById('totalTopics').textContent = stats.totalTopics;
        document.getElementById('totalScripts').textContent = stats.totalScripts;
        document.getElementById('avgScore').textContent = stats.avgScore ? stats.avgScore + '%' : '—';
    },

    renderRecentProjects() {
        const container = document.getElementById('recentProjects');
        const projects = Storage.getProjects().slice(0, 5);

        if (projects.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <span class="empty-icon">🎬</span>
                    <p>No projects yet. Start by running a pipeline!</p>
                </div>`;
            return;
        }

        container.innerHTML = projects.map(p => `
            <div class="project-item" onclick="App.loadProject('${p.id}')">
                <div class="project-info">
                    <span class="project-title">${Helpers.escapeHtml(p.topic || 'Untitled')}</span>
                    <span class="project-date">${Helpers.timeAgo(p.updatedAt)}</span>
                </div>
                <span class="project-score">${p.viralScore ? p.viralScore + '/10' : '—'}</span>
            </div>
        `).join('');
    },

    bindQuickActions() {
        document.querySelectorAll('.quick-action-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                App.switchModule(btn.dataset.action);
            });
        });
    }
};
