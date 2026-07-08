// ==========================================
// Helpers — Shared utility functions
// ==========================================

const Helpers = {
    // Copy text to clipboard
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            App.showToast('Copied to clipboard!', 'success');
        } catch {
            const ta = document.createElement('textarea');
            ta.value = text;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            App.showToast('Copied to clipboard!', 'success');
        }
    },

    // Simple markdown to HTML converter
    markdownToHtml(md) {
        if (!md) return '';
        let html = md
            // Headers
            .replace(/^######\s(.+)$/gm, '<h6>$1</h6>')
            .replace(/^#####\s(.+)$/gm, '<h5>$1</h5>')
            .replace(/^####\s(.+)$/gm, '<h4>$1</h4>')
            .replace(/^###\s(.+)$/gm, '<h3>$1</h3>')
            .replace(/^##\s(.+)$/gm, '<h2>$1</h2>')
            .replace(/^#\s(.+)$/gm, '<h1>$1</h1>')
            // Bold and italic
            .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            // Inline code
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            // Blockquote
            .replace(/^>\s(.+)$/gm, '<blockquote>$1</blockquote>')
            // Horizontal rule
            .replace(/^---$/gm, '<hr>')
            // Unordered list
            .replace(/^[\-\*]\s(.+)$/gm, '<li>$1</li>')
            // Ordered list
            .replace(/^\d+\.\s(.+)$/gm, '<li>$1</li>')
            // Line breaks
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>');

        // Wrap consecutive <li> in <ul>
        html = html.replace(/(<li>.*?<\/li>)(\s*<br>)?/g, '$1');
        html = html.replace(/((?:<li>.*?<\/li>\s*)+)/g, '<ul>$1</ul>');

        return `<p>${html}</p>`;
    },

    // Format date
    formatDate(date) {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    },

    // Format time ago
    timeAgo(date) {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        if (seconds < 60) return 'just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    },

    // Generate unique ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    },

    // Truncate text
    truncate(text, maxLen = 100) {
        if (text.length <= maxLen) return text;
        return text.substring(0, maxLen) + '...';
    },

    // Create result HTML with copy button
    createResultHtml(title, content, raw) {
        return `
            <div class="result-header">
                <h3>${title}</h3>
                <div class="result-actions">
                    <button class="btn btn-sm btn-secondary" onclick="Helpers.copyToClipboard(document.getElementById('raw-${title.replace(/\s/g, '')}').dataset.raw)">📋 Copy</button>
                </div>
            </div>
            <div class="result-content" id="raw-${title.replace(/\s/g, '')}" data-raw="${Helpers.escapeHtml(raw || content)}">
                ${Helpers.markdownToHtml(content)}
            </div>
        `;
    },

    // Escape HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    // Count words
    wordCount(text) {
        return text.trim().split(/\s+/).filter(w => w.length > 0).length;
    },

    // Estimate speaking duration (words per minute)
    estimateDuration(text, wpm = 150) {
        const words = Helpers.wordCount(text);
        const seconds = Math.round((words / wpm) * 60);
        return { words, seconds, display: `~${seconds}s (${words} words)` };
    }
};
