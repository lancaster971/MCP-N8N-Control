/**
 * Mini HTTP Server per servire l'Admin Interface
 * Risolve problemi CORS con file:// protocol
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3002;
const ADMIN_DIR = __dirname;

// MIME types
const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    // CORS headers per permettere chiamate al backend
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    let filePath = req.url === '/' ? '/index.html' : req.url;
    filePath = path.join(ADMIN_DIR, filePath);

    // Sicurezza: previeni directory traversal
    if (!filePath.startsWith(ADMIN_DIR)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404);
                res.end('File not found');
            } else {
                res.writeHead(500);
                res.end('Server error');
            }
            return;
        }

        const ext = path.extname(filePath);
        const contentType = mimeTypes[ext] || 'text/plain';

        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
    });
});

server.listen(PORT, () => {
    console.log(`
🎛️  ADMIN INTERFACE SERVER STARTED
=====================================
📡 URL: http://localhost:${PORT}
🔗 Backend: http://localhost:3001
🔐 Login: admin@n8n-mcp.local / admin123
=====================================
    `);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down Admin Interface server...');
    server.close(() => {
        console.log('✅ Admin Interface server stopped');
        process.exit(0);
    });
});