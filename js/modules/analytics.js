// ==========================================
// Analytics Module — Phase 12
// ==========================================

const AnalyticsModule = {
    init() {
        document.getElementById('saveAnalytics').addEventListener('click', () => this.saveEntry());
        this.renderHistory();
        this.renderChart();
    },

    saveEntry() {
        const title = document.getElementById('analyticsTitle').value;
        const date = document.getElementById('analyticsDate').value;
        const views = parseInt(document.getElementById('analyticsViews').value) || 0;
        const ctr = parseFloat(document.getElementById('analyticsCTR').value) || 0;
        const retention = parseFloat(document.getElementById('analyticsRetention').value) || 0;
        const likes = parseInt(document.getElementById('analyticsLikes').value) || 0;
        const comments = parseInt(document.getElementById('analyticsComments').value) || 0;
        const shares = parseInt(document.getElementById('analyticsShares').value) || 0;

        if (!title) {
            App.showToast('Please enter a video title', 'error');
            return;
        }

        Storage.saveAnalytics({
            title, date, views, ctr, retention, likes, comments, shares
        });

        // Clear form
        document.getElementById('analyticsTitle').value = '';
        document.getElementById('analyticsViews').value = '';
        document.getElementById('analyticsCTR').value = '';
        document.getElementById('analyticsRetention').value = '';
        document.getElementById('analyticsLikes').value = '';
        document.getElementById('analyticsComments').value = '';
        document.getElementById('analyticsShares').value = '';

        this.renderHistory();
        this.renderChart();
        DashboardModule.updateStats();
        App.showToast('Performance data saved!', 'success');
    },

    renderHistory() {
        const container = document.getElementById('analyticsHistory');
        const data = Storage.getAnalytics();

        if (data.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <span class="empty-icon">📊</span>
                    <p>No performance data yet. Add your first video above!</p>
                </div>`;
            return;
        }

        container.innerHTML = `
            <div class="result-header"><h3>Performance History</h3></div>
            <div style="overflow-x:auto;">
                <table style="width:100%;border-collapse:collapse;margin-top:12px;">
                    <thead>
                        <tr>
                            <th style="padding:8px 12px;border-bottom:1px solid var(--bg-glass-border);text-align:left;font-size:12px;color:var(--text-muted);">Title</th>
                            <th style="padding:8px 12px;border-bottom:1px solid var(--bg-glass-border);text-align:right;font-size:12px;color:var(--text-muted);">Views</th>
                            <th style="padding:8px 12px;border-bottom:1px solid var(--bg-glass-border);text-align:right;font-size:12px;color:var(--text-muted);">CTR%</th>
                            <th style="padding:8px 12px;border-bottom:1px solid var(--bg-glass-border);text-align:right;font-size:12px;color:var(--text-muted);">Ret%</th>
                            <th style="padding:8px 12px;border-bottom:1px solid var(--bg-glass-border);text-align:right;font-size:12px;color:var(--text-muted);">Likes</th>
                            <th style="padding:8px 12px;border-bottom:1px solid var(--bg-glass-border);text-align:right;font-size:12px;color:var(--text-muted);">Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map(d => `
                            <tr>
                                <td style="padding:8px 12px;font-size:13px;font-weight:500;">${Helpers.escapeHtml(d.title)}</td>
                                <td style="padding:8px 12px;text-align:right;font-size:13px;">${d.views.toLocaleString()}</td>
                                <td style="padding:8px 12px;text-align:right;font-size:13px;">${d.ctr}%</td>
                                <td style="padding:8px 12px;text-align:right;font-size:13px;"><span class="score-badge ${d.retention >= 70 ? 'score-high' : d.retention >= 40 ? 'score-mid' : 'score-low'}">${d.retention}%</span></td>
                                <td style="padding:8px 12px;text-align:right;font-size:13px;">${d.likes.toLocaleString()}</td>
                                <td style="padding:8px 12px;text-align:right;font-size:12px;color:var(--text-muted);">${d.date || '—'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>`;
    },

    renderChart() {
        const container = document.getElementById('analyticsChart');
        const data = Storage.getAnalytics().slice(0, 10).reverse();

        if (data.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>Add performance data to see charts</p></div>';
            return;
        }

        const maxViews = Math.max(...data.map(d => d.views), 1);

        container.innerHTML = `
            <h3 style="font-size:14px;font-weight:700;margin-bottom:16px;">Views Trend</h3>
            <div class="chart-bar-container">
                ${data.map(d => {
            const height = Math.max((d.views / maxViews) * 140, 4);
            return `
                        <div class="chart-bar" style="height:${height}px;" title="${d.title}: ${d.views.toLocaleString()} views">
                            <span class="chart-bar-value">${d.views >= 1000 ? (d.views / 1000).toFixed(1) + 'k' : d.views}</span>
                            <span class="chart-bar-label">${Helpers.truncate(d.title, 8)}</span>
                        </div>`;
        }).join('')}
            </div>
            <div style="height:30px;"></div>`;
    }
};
