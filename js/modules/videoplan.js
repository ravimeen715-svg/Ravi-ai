// ==========================================
// Video Plan Module — Phase 6 & 7
// ==========================================

const VideoplanModule = {
    init() {
        document.getElementById('runVideoplan').addEventListener('click', () => this.run());
    },

    async run(script = null, scenes = null) {
        const scriptInput = script || document.getElementById('videoScript').value;
        const scenesInput = scenes || document.getElementById('videoScenes')?.value || '';

        if (!scriptInput) {
            App.showToast('Please enter or paste the script', 'error');
            return null;
        }

        try {
            const result = await GeminiAPI.call(
                GeminiAPI.prompts.videoplan(scriptInput, scenesInput),
                '🎥 Creating video editing plan...'
            );

            const resultArea = document.getElementById('videoplanResult');
            resultArea.classList.remove('hidden');
            resultArea.innerHTML = Helpers.createResultHtml('Video & Editing Plan', result, result);

            App.currentProject.videoplan = result;
            Storage.saveProject(App.currentProject);

            App.showToast('Video plan ready!', 'success');
            return result;
        } catch (e) {
            return null;
        }
    }
};
