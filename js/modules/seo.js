// ==========================================
// SEO Module — Phase 9
// ==========================================

const SeoModule = {
    init() {
        document.getElementById('runSeo').addEventListener('click', () => this.run());
    },

    async run(topic = null) {
        const topicInput = topic || document.getElementById('seoTopic').value;
        const script = document.getElementById('seoScript')?.value || '';

        if (!topicInput) {
            App.showToast('Please enter a video topic', 'error');
            return null;
        }

        try {
            const result = await GeminiAPI.call(
                GeminiAPI.prompts.seo(topicInput, script),
                '🔎 Optimizing SEO...'
            );

            const resultArea = document.getElementById('seoResult');
            resultArea.classList.remove('hidden');
            resultArea.innerHTML = Helpers.createResultHtml('SEO Optimization', result, result);

            App.currentProject.seo = result;
            Storage.saveProject(App.currentProject);

            App.showToast('SEO optimized!', 'success');
            return result;
        } catch (e) {
            return null;
        }
    }
};
