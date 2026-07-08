// ==========================================
// Trends Module — Phase 1
// ==========================================

const TrendsModule = {
    init() {
        document.getElementById('trendNiche').addEventListener('change', (e) => {
            document.getElementById('customNiche').classList.toggle('hidden', e.target.value !== 'Custom');
        });

        document.getElementById('runTrends').addEventListener('click', () => this.run());
    },

    async run(niche = null) {
        const nicheSelect = document.getElementById('trendNiche');
        const selectedNiche = niche || (nicheSelect.value === 'Custom'
            ? document.getElementById('customNiche').value
            : nicheSelect.value);

        if (!selectedNiche) {
            App.showToast('Please select or enter a niche', 'error');
            return null;
        }

        const context = document.getElementById('trendContext')?.value || '';

        try {
            const result = await GeminiAPI.call(
                GeminiAPI.prompts.trends(selectedNiche, context),
                '🔍 Researching trends...'
            );

            const resultArea = document.getElementById('trendsResult');
            resultArea.classList.remove('hidden');
            resultArea.innerHTML = Helpers.createResultHtml('Trend Research Results', result, result);

            // Save to current project
            App.currentProject.topic = selectedNiche;
            App.currentProject.trendResults = result;
            Storage.saveProject(App.currentProject);

            App.showToast('Trends discovered!', 'success');
            return result;
        } catch (e) {
            return null;
        }
    }
};
