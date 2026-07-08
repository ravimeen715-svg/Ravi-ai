// ==========================================
// Strategy Module — Phase 2
// ==========================================

const StrategyModule = {
    init() {
        document.getElementById('runStrategy').addEventListener('click', () => this.run());
    },

    async run(topic = null) {
        const topicInput = topic || document.getElementById('strategyTopic').value;

        if (!topicInput) {
            App.showToast('Please enter a topic to validate', 'error');
            return null;
        }

        try {
            const result = await GeminiAPI.call(
                GeminiAPI.prompts.strategy(topicInput),
                '🎯 Validating content strategy...'
            );

            const resultArea = document.getElementById('strategyResult');
            resultArea.classList.remove('hidden');
            resultArea.innerHTML = Helpers.createResultHtml('Strategy Validation', result, result);

            App.currentProject.strategyResult = result;
            App.currentProject.validatedTopic = topicInput;
            Storage.saveProject(App.currentProject);

            App.showToast('Strategy validated!', 'success');
            return result;
        } catch (e) {
            return null;
        }
    }
};
