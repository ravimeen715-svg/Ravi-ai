// ==========================================
// Quality Control Module — Phase 10
// ==========================================

const QualityModule = {
    init() {
        document.getElementById('runQuality').addEventListener('click', () => this.run());
    },

    async run(script = null, meta = null) {
        const scriptInput = script || document.getElementById('qualityScript').value;
        const metaInput = meta || document.getElementById('qualityMeta')?.value || '';

        if (!scriptInput) {
            App.showToast('Please enter the script to check', 'error');
            return null;
        }

        try {
            const result = await GeminiAPI.call(
                GeminiAPI.prompts.quality(scriptInput, metaInput),
                '✅ Running quality control...'
            );

            const resultArea = document.getElementById('qualityResult');
            resultArea.classList.remove('hidden');
            resultArea.innerHTML = Helpers.createResultHtml('Quality Control Report', result, result);

            App.currentProject.qualityCheck = result;
            Storage.saveProject(App.currentProject);

            App.showToast('Quality check complete!', 'success');
            return result;
        } catch (e) {
            return null;
        }
    }
};
