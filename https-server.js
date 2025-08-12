const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// SSL certificate options
const sslOptions = {
    key: fs.readFileSync(path.join(__dirname, 'ssl', 'server.key')),
    cert: fs.readFileSync(path.join(__dirname, 'ssl', 'server.crt'))
};

// MIME types for different file extensions
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.ico': 'image/x-icon',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.eot': 'application/vnd.ms-fontobject',
    '.ttf': 'application/font-sfnt'
};

function serveFile(res, filePath) {
    const extname = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                // File not found
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 - File Not Found</h1>', 'utf-8');
            } else {
                // Server error
                res.writeHead(500);
                res.end(`Server Error: ${error.code}`, 'utf-8');
            }
        } else {
            // Set security headers
            res.setHeader('X-Frame-Options', 'SAMEORIGIN');
            res.setHeader('X-Content-Type-Options', 'nosniff');
            res.setHeader('X-XSS-Protection', '1; mode=block');
            res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
            res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
            
            // Set cache headers
            if (extname === '.html') {
                res.setHeader('Cache-Control', 'public, max-age=3600'); // 1 hour
            } else if (['.css', '.js', '.png', '.jpg', '.gif', '.ico', '.svg'].includes(extname)) {
                res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year
            }
            
            // Service worker - no cache
            if (filePath.endsWith('sw.js')) {
                res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            }

            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
}

function requestHandler(req, res) {
    const parsedUrl = url.parse(req.url);
    let pathname = parsedUrl.pathname;

    // Default to index.html
    if (pathname === '/') {
        pathname = '/index.html';
    }

    // Health check endpoint
    if (pathname === '/health') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('OK');
        return;
    }

    const filePath = path.join(__dirname, pathname);
    serveFile(res, filePath);
}

// Create HTTP server (redirects to HTTPS)
const httpServer = http.createServer((req, res) => {
    // Redirect all HTTP traffic to HTTPS
    const host = req.headers.host;
    const redirectUrl = `https://${host}${req.url}`;
    
    res.writeHead(301, {
        'Location': redirectUrl,
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
    });
    res.end();
});

// Create HTTPS server
const httpsServer = https.createServer(sslOptions, requestHandler);

// Start servers
const HTTP_PORT = 3080;
const HTTPS_PORT = 3443;

httpServer.listen(HTTP_PORT, () => {
    console.log(`🔓 HTTP Server running on http://localhost:${HTTP_PORT}`);
    console.log(`   (Redirects to HTTPS)`);
});

httpsServer.listen(HTTPS_PORT, () => {
    console.log(`🔒 HTTPS Server running on https://localhost:${HTTPS_PORT}`);
    console.log(`\n🎮 Your Dichoptic Therapy Game is now available at:`);
    console.log(`   https://localhost:${HTTPS_PORT}`);
    console.log(`\n⚠️  Note: You'll see a security warning for the self-signed certificate.`);
    console.log(`   Click "Advanced" → "Proceed to localhost (unsafe)" to continue.`);
    console.log(`\n🛑 To stop the server, press Ctrl+C`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\n🛑 Shutting down servers...');
    httpServer.close(() => {
        console.log('✅ HTTP server closed');
    });
    httpsServer.close(() => {
        console.log('✅ HTTPS server closed');
        process.exit(0);
    });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});
