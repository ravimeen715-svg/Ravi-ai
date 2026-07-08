// ==========================================
// Scenes Module — Phase 4
// ==========================================

const ScenesModule = {
    init() {
        document.getElementById('runScenes').addEventListener('click', () => this.run());
    },

    async run(script = null) {
        const scriptInput = script || document.getElementById('scenesScript').value;

        if (!scriptInput) {
            App.showToast('Please enter or paste the script', 'error');
            return null;
        }

        try {
            const result = await GeminiAPI.call(
                GeminiAPI.prompts.scenes(scriptInput),
                '🎬 Breaking down scenes...'
            );

            const resultArea = document.getElementById('scenesResult');
            resultArea.classList.remove('hidden');
            resultArea.innerHTML = Helpers.createResultHtml('Scene Breakdown & Image Prompts', result, result);

            App.currentProject.scenes = result;
            Storage.saveProject(App.currentProject);

            App.showToast('Scenes created!', 'success');
            return result;
        } catch (e) {
            return null;
        }
    }
};
