// ==========================================
// Voiceover Module — Phase 5
// ==========================================

const VoiceoverModule = {
    init() {
        document.getElementById('runVoiceover').addEventListener('click', () => this.run());
    },

    async run(script = null) {
        const scriptInput = script || document.getElementById('voiceScript').value;

        if (!scriptInput) {
            App.showToast('Please enter or paste the script', 'error');
            return null;
        }

        try {
            const result = await GeminiAPI.call(
                GeminiAPI.prompts.voiceover(scriptInput),
                '🎙️ Creating voiceover guide...'
            );

            const resultArea = document.getElementById('voiceoverResult');
            resultArea.classList.remove('hidden');
            resultArea.innerHTML = Helpers.createResultHtml('Voiceover Guide', result, result);

            App.currentProject.voiceover = result;
            Storage.saveProject(App.currentProject);

            App.showToast('Voiceover guide ready!', 'success');
            return result;
        } catch (e) {
            return null;
        }
    }
};
