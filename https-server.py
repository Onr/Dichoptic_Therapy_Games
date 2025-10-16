#!/usr/bin/env python3

import http.server
import ssl
import socketserver
import sys
import json
from datetime import datetime
from pathlib import Path

class HTTPSRequestHandler(http.server.SimpleHTTPRequestHandler):
    STORAGE_DIR = Path('monitoring')

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

        # Allow client-side fetch requests to the lightweight APIs
        if self.path.startswith('/api/'):
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')

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

    def do_OPTIONS(self):
        if self.path in ('/api/feedback', '/api/newsletter'):
            self.send_response(204)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
            self.end_headers()
        else:
            super().do_OPTIONS()

    def do_POST(self):
        if self.path == '/api/feedback':
            self._handle_feedback_submission()
        elif self.path == '/api/newsletter':
            self._handle_newsletter_submission()
        else:
            self.send_error(404, "Unsupported endpoint")

    # --- Internal helpers -------------------------------------------------
    def _load_json_payload(self):
        length = int(self.headers.get('Content-Length', 0))
        raw = self.rfile.read(length) if length else b''
        if not raw:
            return {}
        try:
            return json.loads(raw.decode('utf-8'))
        except json.JSONDecodeError:
            self.send_error(400, "Invalid JSON payload")
            raise

    def _ensure_storage(self):
        try:
            self.STORAGE_DIR.mkdir(parents=True, exist_ok=True)
        except OSError as exc:
            self.send_error(500, f"Unable to prepare storage: {exc}")
            raise

    def _append_record(self, filename, record):
        self._ensure_storage()
        target = self.STORAGE_DIR / filename
        try:
            with target.open('a', encoding='utf-8') as handle:
                handle.write(json.dumps(record, ensure_ascii=False) + '\n')
        except OSError as exc:
            self.send_error(500, f"Unable to persist data: {exc}")
            raise

    def _respond_json(self, status_code, payload):
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(payload).encode('utf-8'))

    def _handle_feedback_submission(self):
        try:
            payload = self._load_json_payload()
        except json.JSONDecodeError:
            return

        record = {
            'timestamp': datetime.utcnow().isoformat() + 'Z',
            'satisfaction': payload.get('satisfaction'),
            'featureRequests': payload.get('featureRequests', '').strip(),
            'accessibilityNeeds': payload.get('accessibilityNeeds', '').strip(),
            'email': payload.get('email', '').strip() or None,
            'userAgent': self.headers.get('User-Agent')
        }

        try:
            self._append_record('feedback.jsonl', record)
        except OSError:
            return

        self._respond_json(201, {'status': 'stored'})

    def _handle_newsletter_submission(self):
        try:
            payload = self._load_json_payload()
        except json.JSONDecodeError:
            return

        if not payload.get('consent'):
            self._respond_json(400, {'error': 'Consent is required.'})
            return

        email = (payload.get('email') or '').strip()
        if not email:
            self._respond_json(400, {'error': 'Email is required.'})
            return

        record = {
            'timestamp': datetime.utcnow().isoformat() + 'Z',
            'email': email,
            'interest': payload.get('interest', 'general'),
            'consent': True
        }

        try:
            self._append_record('newsletter.jsonl', record)
        except OSError:
            return

        self._respond_json(201, {'status': 'subscribed'})

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
