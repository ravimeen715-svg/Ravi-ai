const VoiceoverModule = {
    init() {
        const btn = document.getElementById('runVoiceover');
        if (btn) {
            btn.addEventListener('click', async () => {
                await this.generateVoice();
            });
        }
    },

    async generateVoice() {
        const script = document.getElementById('voiceScript').value.trim();
        const provider = document.getElementById('voiceProvider').value;
        const voicePreset = document.getElementById('voicePreset').value.trim();
        const speed = document.getElementById('voiceSpeed').value;

        if (!script) {
            App.showToast('Please enter a script first', 'error');
            return;
        }

        App.showLoading('Generating voice via backend... 🎙️');

        try {
            const response = await fetch('http://localhost:9090/api/voice', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    script: script,
                    provider: provider,
                    voice: voicePreset,
                    speed: speed,
                    api_key: Storage.getApiKey() // Only used if provider needs it
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || 'Backend failed to generate voice');
            }

            const data = await response.json();

            // Show result
            document.getElementById('voiceoverResult').classList.remove('hidden');
            const audioElem = document.getElementById('voiceoverAudio');
            const downloadElem = document.getElementById('voiceoverDownload');

            // Add cache-busting timestamp
            const audioUrl = `http://localhost:9090${data.file_url}?t=${Date.now()}`;
            audioElem.src = audioUrl;
            downloadElem.href = audioUrl;

            App.currentProject.voiceoverUrl = audioUrl;
            Storage.saveProject(App.currentProject);

            App.showToast('Voice generated successfully!', 'success');

            // Continue pipeline if running
            if (App.pipelineRunning) {
                App.updatePipelineStep(4, 'completed', '✅');
            }
        } catch (error) {
            App.showToast(error.message, 'error');
            console.error(error);
        } finally {
            App.hideLoading();
        }
    }
};
