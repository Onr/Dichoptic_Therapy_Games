#!/usr/bin/env python3

import http.server
import socketserver
from urllib.parse import urlparse

class RedirectHandler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        # Redirect to HTTPS
        self.send_response(301)
        self.send_header('Location', f'https://localhost:8443{self.path}')
        self.send_header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
        self.end_headers()
    
    def do_POST(self):
        self.do_GET()

def main():
    PORT = 8080
    
    with socketserver.TCPServer(("", PORT), RedirectHandler) as httpd:
        print(f"🔓 HTTP Redirect Server running on http://localhost:{PORT}")
        print(f"   (Redirects to HTTPS)")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n🛑 Redirect server stopped")
            httpd.shutdown()

if __name__ == "__main__":
    main()
