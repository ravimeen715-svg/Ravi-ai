// ==========================================
// Script Writer Module — Phase 3
// ==========================================

const ScriptwriterModule = {
    init() {
        document.getElementById('runScript').addEventListener('click', () => this.run());
    },

    async run(topic = null) {
        const topicInput = topic || document.getElementById('scriptTopic').value;
        const duration = document.getElementById('scriptDuration').value;
        const tone = document.getElementById('scriptTone').value;
        const angle = document.getElementById('scriptAngle')?.value || '';

        if (!topicInput) {
            App.showToast('Please enter a topic', 'error');
            return null;
        }

        try {
            const result = await GeminiAPI.call(
                GeminiAPI.prompts.script(topicInput, duration, tone, angle),
                '✍️ Writing script...'
            );

            const resultArea = document.getElementById('scriptResult');
            resultArea.classList.remove('hidden');
            resultArea.innerHTML = Helpers.createResultHtml('Generated Script', result, result);

            App.currentProject.script = result;
            App.currentProject.scriptTopic = topicInput;
            Storage.saveProject(App.currentProject);

            App.showToast('Script generated!', 'success');
            return result;
        } catch (e) {
            return null;
        }
    }
};
