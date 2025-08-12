#!/usr/bin/env python3

import http.server
import ssl
import socketserver
import os
import sys
from pathlib import Path

class HTTPSRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add security headers
        self.send_header('X-Frame-Options', 'SAMEORIGIN')
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('X-XSS-Protection', '1; mode=block')
        self.send_header('Referrer-Policy', 'strict-origin-when-cross-origin')
        self.send_header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
        
        # Cache control
        if self.path.endswith(('.css', '.js', '.png', '.jpg', '.gif', '.ico', '.svg')):
            self.send_header('Cache-Control', 'public, max-age=31536000')
        elif self.path.endswith('.html'):
            self.send_header('Cache-Control', 'public, max-age=3600')
        elif self.path.endswith('sw.js'):
            self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        
        super().end_headers()
    
    def do_GET(self):
        # Health check endpoint
        if self.path == '/health':
            self.send_response(200)
            self.send_header('Content-type', 'text/plain')
            self.end_headers()
            self.wfile.write(b'OK')
            return
        
        # Default to index.html for root
        if self.path == '/':
            self.path = '/index.html'
        
        super().do_GET()

def main():
    # Check if SSL certificates exist
    cert_file = Path('ssl/server.crt')
    key_file = Path('ssl/server.key')
    
    if not cert_file.exists() or not key_file.exists():
        print("❌ SSL certificates not found!")
        print("Please run: ./start-server.sh to generate certificates")
        print("Or generate them manually:")
        print("mkdir -p ssl")
        print("openssl req -x509 -nodes -days 365 -newkey rsa:2048 \\")
        print("  -keyout ssl/server.key -out ssl/server.crt \\")
        print("  -subj '/C=US/ST=Development/L=Local/O=Dichoptic Therapy Games/CN=localhost'")
        sys.exit(1)
    
    # Server configuration
    PORT = 8443
    
    # Create server
    with socketserver.TCPServer(("", PORT), HTTPSRequestHandler) as httpd:
        # Add SSL context
        context = ssl.create_default_context(ssl.Purpose.CLIENT_AUTH)
        context.load_cert_chain(certfile=str(cert_file), keyfile=str(key_file))
        httpd.socket = context.wrap_socket(httpd.socket, server_side=True)
        
        print(f"🔒 HTTPS Server running on https://localhost:{PORT}")
        print(f"\n🎮 Your Dichoptic Therapy Game is now available at:")
        print(f"   https://localhost:{PORT}")
        print(f"\n⚠️  Note: You'll see a security warning for the self-signed certificate.")
        print(f"   Click 'Advanced' → 'Proceed to localhost (unsafe)' to continue.")
        print(f"\n🛑 To stop the server, press Ctrl+C")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\n🛑 Shutting down server...")
            httpd.shutdown()
            print("✅ Server stopped")

if __name__ == "__main__":
    main()
