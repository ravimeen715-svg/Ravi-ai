const PublishModule = {
    init() {
        const btn = document.getElementById('runPublish');
        if (btn) {
            btn.addEventListener('click', async () => {
                await this.uploadToYouTube();
            });
        }
    },

    async uploadToYouTube() {
        const title = document.getElementById('publishTopic').value.trim() || 'AI Generated Short';
        const tagsStr = document.getElementById('publishTags').value.trim();
        const description = document.getElementById('publishDescription').value.trim();
        const approved = document.getElementById('humanApprovalCheck').checked;

        if (!approved) {
            App.showToast('You must check the Human Approval box before uploading!', 'error');
            return;
        }

        const tags = tagsStr.split(',').map(t => t.trim());

        App.showLoading('Uploading to YouTube API... 🚀 Please check backend terminal for OAuth popup!');

        try {
            const response = await fetch('http://localhost:9090/api/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: title,
                    description: description,
                    tags: tags
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || 'Backend failed to upload video');
            }

            const data = await response.json();

            // Show result
            document.getElementById('publishResult').classList.remove('hidden');
            document.getElementById('publishResult').innerHTML = `
                <h3>✅ Upload Successful!</h3>
                <p>Video ID: <strong>${data.video_id}</strong></p>
                <a href="https://studio.youtube.com/video/${data.video_id}/edit" target="_blank" class="btn btn-secondary" style="margin-top:10px;">Open in YouTube Studio</a>
            `;

            App.currentProject.youtubeId = data.video_id;
            Storage.saveProject(App.currentProject);

            App.showToast('Video uploaded successfully!', 'success');

            // Continue pipeline if running
            if (App.pipelineRunning) {
                App.updatePipelineStep(10, 'completed', '✅');
            }
        } catch (error) {
            App.showToast(error.message, 'error');
            console.error(error);
        } finally {
            App.hideLoading();
        }
    }
};
