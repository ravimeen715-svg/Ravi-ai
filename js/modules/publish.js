// ==========================================
// Publish Module — Phase 11
// ==========================================

const PublishModule = {
    init() {
        document.getElementById('runPublish').addEventListener('click', () => this.run());
    },

    async run(topic = null) {
        const topicInput = topic || document.getElementById('publishTopic').value;

        if (!topicInput) {
            App.showToast('Please enter the video topic', 'error');
            return null;
        }

        try {
            const result = await GeminiAPI.call(
                GeminiAPI.prompts.publish(topicInput),
                '🚀 Creating publish guide...'
            );

            const resultArea = document.getElementById('publishResult');
            resultArea.classList.remove('hidden');
            resultArea.innerHTML = Helpers.createResultHtml('Publishing Guide', result, result);

            App.currentProject.publishGuide = result;
            Storage.saveProject(App.currentProject);

            App.showToast('Publish guide ready!', 'success');
            return result;
        } catch (e) {
            return null;
        }
    }
};
