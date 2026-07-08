// ==========================================
// Self-Improvement Module — Phase 13
// ==========================================

const ImproveModule = {
    init() {
        document.getElementById('runImprove').addEventListener('click', () => this.run());
    },

    async run() {
        const analytics = Storage.getAnalytics();

        if (analytics.length < 2) {
            App.showToast('Need at least 2 videos in Performance Analytics to analyze patterns', 'error');
            return null;
        }

        try {
            const result = await GeminiAPI.call(
                GeminiAPI.prompts.improve(analytics),
                '🧠 Analyzing patterns & learning...'
            );

            const resultArea = document.getElementById('improveResult');
            resultArea.classList.remove('hidden');
            resultArea.innerHTML = Helpers.createResultHtml('Self-Improvement Report', result, result);

            App.showToast('Learning complete!', 'success');
            return result;
        } catch (e) {
            return null;
        }
    }
};
