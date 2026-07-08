// ==========================================
// Storage — LocalStorage manager
// ==========================================

const Storage = {
    PREFIX: 'johnson_ai_',

    // Save API key
    saveApiKey(key) {
        localStorage.setItem(this.PREFIX + 'api_key', key);
    },

    // Get API key
    getApiKey() {
        return localStorage.getItem(this.PREFIX + 'api_key') || '';
    },

    // Save settings
    saveSettings(settings) {
        localStorage.setItem(this.PREFIX + 'settings', JSON.stringify(settings));
    },

    // Get settings
    getSettings() {
        const data = localStorage.getItem(this.PREFIX + 'settings');
        return data ? JSON.parse(data) : { defaultNiche: 'AI Tools & Technology' };
    },

    // Save a project
    saveProject(project) {
        const projects = this.getProjects();
        const existing = projects.findIndex(p => p.id === project.id);
        if (existing >= 0) {
            projects[existing] = { ...projects[existing], ...project, updatedAt: new Date().toISOString() };
        } else {
            project.id = project.id || Helpers.generateId();
            project.createdAt = new Date().toISOString();
            project.updatedAt = project.createdAt;
            projects.unshift(project);
        }
        localStorage.setItem(this.PREFIX + 'projects', JSON.stringify(projects));
        return project;
    },

    // Get all projects
    getProjects() {
        const data = localStorage.getItem(this.PREFIX + 'projects');
        return data ? JSON.parse(data) : [];
    },

    // Get project by ID
    getProject(id) {
        return this.getProjects().find(p => p.id === id);
    },

    // Delete project
    deleteProject(id) {
        const projects = this.getProjects().filter(p => p.id !== id);
        localStorage.setItem(this.PREFIX + 'projects', JSON.stringify(projects));
    },

    // Save analytics data
    saveAnalytics(entry) {
        const data = this.getAnalytics();
        entry.id = entry.id || Helpers.generateId();
        entry.addedAt = new Date().toISOString();
        data.unshift(entry);
        localStorage.setItem(this.PREFIX + 'analytics', JSON.stringify(data));
        return entry;
    },

    // Get analytics data
    getAnalytics() {
        const data = localStorage.getItem(this.PREFIX + 'analytics');
        return data ? JSON.parse(data) : [];
    },

    // Get stats
    getStats() {
        const projects = this.getProjects();
        const analytics = this.getAnalytics();
        return {
            totalVideos: projects.length,
            totalTopics: projects.filter(p => p.topic).length,
            totalScripts: projects.filter(p => p.script).length,
            avgScore: analytics.length > 0
                ? Math.round(analytics.reduce((s, a) => s + (a.retention || 0), 0) / analytics.length)
                : null
        };
    },

    // Export all data
    exportAll() {
        const data = {
            projects: this.getProjects(),
            analytics: this.getAnalytics(),
            settings: this.getSettings(),
            exportedAt: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `johnson_ai_backup_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
};
