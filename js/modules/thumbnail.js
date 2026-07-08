// ==========================================
// Thumbnail Module — Phase 8
// ==========================================

const ThumbnailModule = {
    init() {
        document.getElementById('runThumbnail').addEventListener('click', () => this.run());
    },

    async run(topic = null) {
        const topicInput = topic || document.getElementById('thumbTopic').value;
        const visual = document.getElementById('thumbVisual')?.value || '';

        if (!topicInput) {
            App.showToast('Please enter a video topic', 'error');
            return null;
        }

        try {
            const result = await GeminiAPI.call(
                GeminiAPI.prompts.thumbnail(topicInput, visual),
                '🖼️ Creating thumbnail concepts...'
            );

            const resultArea = document.getElementById('thumbnailResult');
            resultArea.classList.remove('hidden');
            resultArea.innerHTML = Helpers.createResultHtml('Thumbnail Concepts', result, result);

            App.currentProject.thumbnails = result;
            Storage.saveProject(App.currentProject);

            App.showToast('Thumbnails designed!', 'success');
            return result;
        } catch (e) {
            return null;
        }
    }
};
