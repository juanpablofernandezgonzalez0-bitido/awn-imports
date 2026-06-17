#!/usr/bin/env python3
import json
import os
import mimetypes
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse

PORT = 8080
PRODUCTS_FILE = 'products.json'
DIR = os.path.dirname(os.path.abspath(__file__))

class Handler(BaseHTTPRequestHandler):

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if path == '/api/products':
            return self.send_products()

        serve_path = path.lstrip('/')
        if not serve_path:
            serve_path = 'index.html'

        full = os.path.join(DIR, serve_path)
        if not os.path.isfile(full):
            self.send_error(404)
            return

        mime, _ = mimetypes.guess_type(full)
        self.send_response(200)
        self.send_header('Content-Type', mime or 'application/octet-stream')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        with open(full, 'rb') as f:
            self.wfile.write(f.read())

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_POST(self):
        parsed = urlparse(self.path)
        if parsed.path != '/api/products':
            self.send_error(404)
            return

        length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(length)
        try:
            data = json.loads(body)
        except:
            self.send_error(400, 'Invalid JSON')
            return

        with open(os.path.join(DIR, PRODUCTS_FILE), 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps({'ok': True}).encode())

    def send_products(self):
        path = os.path.join(DIR, PRODUCTS_FILE)
        if not os.path.exists(path):
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(b'[]')
            return

        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        with open(path, 'rb') as f:
            self.wfile.write(f.read())

if __name__ == '__main__':
    print(f'Servidor corriendo en http://localhost:{PORT}')
    print(f'Admin panel: http://localhost:{PORT}/admin.html')
    server = HTTPServer(('0.0.0.0', PORT), Handler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        server.server_close()
