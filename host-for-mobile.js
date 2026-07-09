const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = 8080;
const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.svg': 'image/svg+xml',
    '.png': 'image/png'
};

const server = http.createServer((req, res) => {
    let filePath = '.' + req.url;
    if (filePath === './') filePath = './index.html';

    // remove query strings
    filePath = filePath.split('?')[0];

    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = MIME_TYPES[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            res.writeHead(404);
            res.end('File missing: ' + filePath);
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

// Get local IPs
function getLocalIps() {
    const interfaces = os.networkInterfaces();
    const ips = [];
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                ips.push(iface.address);
            }
        }
    }
    return ips;
}

server.listen(PORT, '0.0.0.0', () => {
    console.log('\n=============================================');
    console.log('📱 MOBILE AGENT READY!');
    console.log('=============================================');
    console.log('Apne mobile phone ke browser me inme se koi ek link open karein:\n');
    const ips = getLocalIps();
    ips.forEach(ip => {
        console.log(`🔗 http://${ip}:${PORT}`);
    });
    console.log('\n(Dhyan rahe: Aapka Mobile aur PC same WiFi me hone chahiye!)');
    console.log('Mobile me open karne ke baad, menu me "Add to Home Screen" select karein aur ye ek asli app ban jayega!');
    console.log('Acha chalta hoon, terminal band karne par ye server close ho jayega.');
    console.log('=============================================\n');
});
