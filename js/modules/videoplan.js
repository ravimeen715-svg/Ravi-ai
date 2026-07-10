const VideoplanModule = {
    init() {
        const btn = document.getElementById('runVideoplan');
        if (btn) {
            btn.addEventListener('click', async () => {
                await this.generateVideo();
            });
        }
    },

    async generateVideo() {
        const scriptData = document.getElementById('videoScript').value.trim();

        let scenes = [];
        try {
            // Attempt to parse JSON scenes if provided, else dummy data
            scenes = JSON.parse(scriptData);
        } catch {
            // Fallback to simple split if not valid JSON
            scenes = [
                { "text": scriptData ? scriptData.substring(0, 50) : "Intro", "duration": 4.0 },
                { "text": "Main content...", "duration": 5.0 }
            ];
            console.log("Could not parse scenes JSON, using fallback data.");
        }

        App.showLoading('Rendering video with FFmpeg/MoviePy... 🎥 This may take a minute.');

        try {
            const response = await fetch('http://localhost:9090/api/video', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ scenes: scenes })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || 'Backend failed to render video');
            }

            const data = await response.json();

            // Show result
            document.getElementById('videoplanResult').classList.remove('hidden');
            const videoElem = document.getElementById('finalVideoPlayer');
            const downloadElem = document.getElementById('videoDownload');

            // Add cache-busting timestamp
            const videoUrl = `http://localhost:9090${data.file_url}?t=${Date.now()}`;
            videoElem.src = videoUrl;
            downloadElem.href = videoUrl;

            App.currentProject.videoUrl = videoUrl;
            Storage.saveProject(App.currentProject);

            App.showToast('Video rendered successfully!', 'success');

            // Continue pipeline if running
            if (App.pipelineRunning) {
                App.updatePipelineStep(5, 'completed', '✅');
            }
        } catch (error) {
            App.showToast(error.message, 'error');
            console.error(error);
        } finally {
            App.hideLoading();
        }
    }
};
