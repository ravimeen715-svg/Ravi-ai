// ==========================================
// App — Main Controller & Pipeline Orchestrator
// ==========================================

const App = {
    currentModule: 'dashboard',
    currentProject: {},
    pipelineRunning: false,

    init() {
        // Check for API key
        const apiKey = Storage.getApiKey();
        if (apiKey) {
            this.showApp();
        } else {
            this.showApiKeyModal();
        }

        this.bindEvents();
        this.initModules();
    },

    showApiKeyModal() {
        document.getElementById('apiKeyModal').classList.remove('hidden');
        document.getElementById('app').classList.add('hidden');

        document.getElementById('saveApiKey').addEventListener('click', () => {
            const key = document.getElementById('apiKeyInput').value.trim();
            if (!key) {
                this.showToast('Please enter your API key', 'error');
                return;
            }
            Storage.saveApiKey(key);
            document.getElementById('apiKeyModal').classList.add('hidden');
            this.showApp();
            this.showToast('Welcome to JOHNSON AI! 🚀', 'success');
        });

        document.getElementById('apiKeyInput').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') document.getElementById('saveApiKey').click();
        });
    },

    showApp() {
        document.getElementById('apiKeyModal').classList.add('hidden');
        document.getElementById('app').classList.remove('hidden');

        // Init new project
        this.currentProject = { id: Helpers.generateId() };
    },

    bindEvents() {
        // Sidebar navigation
        document.querySelectorAll('.nav-item[data-module]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.switchModule(btn.dataset.module);
            });
        });

        // Sidebar toggle (mobile)
        document.getElementById('sidebarToggle')?.addEventListener('click', () => {
            document.querySelector('.sidebar').classList.toggle('open');
        });

        // Run full pipeline
        document.getElementById('runFullPipeline').addEventListener('click', () => {
            this.runFullPipeline();
        });

        // Settings
        document.getElementById('settingsBtn').addEventListener('click', () => {
            const modal = document.getElementById('settingsModal');
            modal.classList.remove('hidden');
            document.getElementById('settingsApiKey').value = Storage.getApiKey();
            document.getElementById('settingsNiche').value = Storage.getSettings().defaultNiche || '';
        });

        document.getElementById('saveSettings').addEventListener('click', () => {
            const key = document.getElementById('settingsApiKey').value.trim();
            const niche = document.getElementById('settingsNiche').value.trim();
            if (key) Storage.saveApiKey(key);
            Storage.saveSettings({ defaultNiche: niche });
            document.getElementById('settingsModal').classList.add('hidden');
            this.showToast('Settings saved!', 'success');
        });

        document.getElementById('closeSettings').addEventListener('click', () => {
            document.getElementById('settingsModal').classList.add('hidden');
        });

        document.getElementById('exportData').addEventListener('click', () => {
            Storage.exportAll();
            this.showToast('Data exported!', 'success');
        });

        // Close sidebar on content click (mobile)
        document.querySelector('.main-content').addEventListener('click', () => {
            document.querySelector('.sidebar').classList.remove('open');
        });
    },

    initModules() {
        DashboardModule.init();
        TrendsModule.init();
        StrategyModule.init();
        ScriptwriterModule.init();
        ScenesModule.init();
        VoiceoverModule.init();
        VideoplanModule.init();
        ThumbnailModule.init();
        SeoModule.init();
        QualityModule.init();
        PublishModule.init();
        AnalyticsModule.init();
        ImproveModule.init();
    },

    switchModule(moduleName) {
        // Update nav
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        const activeNav = document.querySelector(`.nav-item[data-module="${moduleName}"]`);
        if (activeNav) activeNav.classList.add('active');

        // Update content
        document.querySelectorAll('.module').forEach(m => m.classList.remove('active'));
        const mod = document.getElementById(`mod-${moduleName}`);
        if (mod) mod.classList.add('active');

        // Update title
        const titles = {
            dashboard: 'Dashboard',
            trends: 'Phase 1: Trend Research',
            strategy: 'Phase 2: Content Strategy',
            scriptwriter: 'Phase 3: Script Writer',
            scenes: 'Phase 4: Visual Scenes',
            voiceover: 'Phase 5: Voiceover',
            videoplan: 'Phase 6-7: Video Plan',
            thumbnail: 'Phase 8: Thumbnails',
            seo: 'Phase 9: SEO Optimizer',
            quality: 'Phase 10: Quality Control',
            publish: 'Phase 11: Publish',
            analytics: 'Phase 12: Analytics',
            improve: 'Phase 13: Self-Improve'
        };
        document.getElementById('pageTitle').textContent = titles[moduleName] || moduleName;
        this.currentModule = moduleName;

        // Close mobile sidebar
        document.querySelector('.sidebar').classList.remove('open');
    },

    // ==========================================
    // Full Pipeline Orchestration
    // ==========================================
    async runFullPipeline() {
        if (this.pipelineRunning) {
            this.showToast('Pipeline already running!', 'info');
            return;
        }

        // Get niche
        const settings = Storage.getSettings();
        const niche = settings.defaultNiche || 'AI Tools & Technology';

        this.pipelineRunning = true;
        this.currentProject = { id: Helpers.generateId(), topic: niche };

        const steps = document.querySelectorAll('.pipeline-step');
        const connectors = document.querySelectorAll('.pipeline-connector');

        // Reset pipeline UI
        steps.forEach(s => {
            s.classList.remove('active', 'completed');
            s.querySelector('.step-status').textContent = '⏳';
        });
        connectors.forEach(c => c.classList.remove('active'));

        try {
            // PHASE 1: Trends
            this.updatePipelineStep(0, 'active', '🔄');
            this.switchModule('trends');
            document.getElementById('trendNiche').value = niche;
            const trends = await TrendsModule.run(niche);
            if (!trends) throw new Error('Trend research failed');
            this.updatePipelineStep(0, 'completed', '✅');

            // Extract top topic from trends (use first bold line or niche)
            const topicMatch = trends.match(/\*\*#1 RECOMMENDED.*?\*\*[:\s]*(.+?)(?:\n|$)/i)
                || trends.match(/\*\*1\.\s*(.+?)\*\*/);
            const selectedTopic = topicMatch ? topicMatch[1].replace(/\*\*/g, '').trim() : niche;

            // PHASE 2: Strategy
            await this.delay(1500);
            this.updatePipelineStep(1, 'active', '🔄');
            this.switchModule('strategy');
            document.getElementById('strategyTopic').value = selectedTopic;
            const strategy = await StrategyModule.run(selectedTopic);
            if (!strategy) throw new Error('Strategy validation failed');
            this.updatePipelineStep(1, 'completed', '✅');

            // PHASE 3: Script
            await this.delay(1500);
            this.updatePipelineStep(2, 'active', '🔄');
            this.switchModule('scriptwriter');
            document.getElementById('scriptTopic').value = selectedTopic;
            const script = await ScriptwriterModule.run(selectedTopic);
            if (!script) throw new Error('Script generation failed');
            this.updatePipelineStep(2, 'completed', '✅');

            // PHASE 4: Scenes
            await this.delay(1500);
            this.updatePipelineStep(3, 'active', '🔄');
            this.switchModule('scenes');
            document.getElementById('scenesScript').value = script;
            const scenes = await ScenesModule.run(script);
            if (!scenes) throw new Error('Scene breakdown failed');
            this.updatePipelineStep(3, 'completed', '✅');

            // PHASE 5: Voiceover
            await this.delay(1500);
            this.updatePipelineStep(4, 'active', '🔄');
            this.switchModule('voiceover');
            document.getElementById('voiceScript').value = script;
            const voice = await VoiceoverModule.run(script);
            if (!voice) throw new Error('Voiceover generation failed');
            this.updatePipelineStep(4, 'completed', '✅');

            // PHASE 6-7: Video Plan
            await this.delay(1500);
            this.updatePipelineStep(5, 'active', '🔄');
            this.switchModule('videoplan');
            document.getElementById('videoScript').value = script;
            document.getElementById('videoScenes').value = scenes;
            const videoplan = await VideoplanModule.run(script, scenes);
            if (!videoplan) throw new Error('Video plan generation failed');
            this.updatePipelineStep(5, 'completed', '✅');

            // PHASE 8: Thumbnails
            await this.delay(1500);
            this.updatePipelineStep(6, 'active', '🔄');
            this.switchModule('thumbnail');
            document.getElementById('thumbTopic').value = selectedTopic;
            const thumbs = await ThumbnailModule.run(selectedTopic);
            if (!thumbs) throw new Error('Thumbnail generation failed');
            this.updatePipelineStep(6, 'completed', '✅');

            // PHASE 9: SEO
            await this.delay(1500);
            this.updatePipelineStep(7, 'active', '🔄');
            this.switchModule('seo');
            document.getElementById('seoTopic').value = selectedTopic;
            document.getElementById('seoScript').value = script;
            const seo = await SeoModule.run(selectedTopic);
            if (!seo) throw new Error('SEO optimization failed');
            this.updatePipelineStep(7, 'completed', '✅');

            // PHASE 10: Quality
            await this.delay(1500);
            this.updatePipelineStep(8, 'active', '🔄');
            this.switchModule('quality');
            document.getElementById('qualityScript').value = script;
            document.getElementById('qualityMeta').value = seo;
            const quality = await QualityModule.run(script, seo);
            if (!quality) throw new Error('Quality check failed');
            this.updatePipelineStep(8, 'completed', '✅');

            // PHASE 11: Publish
            await this.delay(1500);
            this.updatePipelineStep(9, 'active', '🔄');
            this.switchModule('publish');
            document.getElementById('publishTopic').value = selectedTopic;
            const publish = await PublishModule.run(selectedTopic);
            if (!publish) throw new Error('Publish guide failed');
            this.updatePipelineStep(9, 'completed', '✅');

            // Save final project
            this.currentProject.topic = selectedTopic;
            this.currentProject.completedAt = new Date().toISOString();
            Storage.saveProject(this.currentProject);

            // Go to dashboard
            await this.delay(1000);
            this.switchModule('dashboard');
            DashboardModule.updateStats();
            DashboardModule.renderRecentProjects();

            this.showToast('🎉 Full pipeline complete! All 13 phases done!', 'success');

        } catch (error) {
            this.showToast(`Pipeline stopped: ${error.message}`, 'error');
        } finally {
            this.pipelineRunning = false;
        }
    },

    updatePipelineStep(index, status, icon) {
        const steps = document.querySelectorAll('.pipeline-step');
        const connectors = document.querySelectorAll('.pipeline-connector');

        if (steps[index]) {
            steps[index].classList.remove('active', 'completed');
            steps[index].classList.add(status);
            steps[index].querySelector('.step-status').textContent = icon;
        }

        // Activate connector before this step
        if (index > 0 && connectors[index - 1]) {
            connectors[index - 1].classList.add('active');
        }
    },

    loadProject(id) {
        const project = Storage.getProject(id);
        if (!project) return;

        this.currentProject = project;

        // Populate fields
        if (project.topic) {
            const topicFields = ['strategyTopic', 'scriptTopic', 'seoTopic', 'thumbTopic', 'publishTopic'];
            topicFields.forEach(f => {
                const el = document.getElementById(f);
                if (el) el.value = project.topic;
            });
        }

        if (project.script) {
            ['scenesScript', 'voiceScript', 'videoScript', 'qualityScript'].forEach(f => {
                const el = document.getElementById(f);
                if (el) el.value = project.script;
            });
        }

        this.showToast(`Loaded project: ${project.topic || 'Untitled'}`, 'info');
    },

    // ==========================================
    // UI Helpers
    // ==========================================
    showLoading(text = 'Processing...') {
        document.getElementById('loadingText').textContent = text;
        document.getElementById('loadingOverlay').classList.remove('hidden');
    },

    hideLoading() {
        document.getElementById('loadingOverlay').classList.add('hidden');
    },

    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `<span>${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span> ${message}`;
        container.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};

// ==========================================
// Initialize on DOM load
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
