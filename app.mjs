import http from 'http';
import https from 'https';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import zlib from 'zlib';
import { promisify } from 'util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const gzip = promisify(zlib.gzip);
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const config = {
  port: process.env.PORT || 3000,
  publicDir: process.env.PUBLIC_DIR || path.join(__dirname, 'public'),
  useHttps: process.env.USE_HTTPS === 'true',
  httpsOptions: {
    key: process.env.HTTPS_KEY_PATH ? fs.readFile(process.env.HTTPS_KEY_PATH) : null,
    cert: process.env.HTTPS_CERT_PATH ? fs.readFile(process.env.HTTPS_CERT_PATH) : null,
  },
};

async function compressData(data, acceptEncoding) {
  if (acceptEncoding.includes('gzip')) {
    return gzip(data);
  }
  return data;
}

async function serveStaticFile(req, res, filePath) {
  try {
    const data = await fs.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const acceptEncoding = req.headers['accept-encoding'] || '';
    const compressedData = await compressData(data, acceptEncoding);

    const headers = {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=3600',
      'Vary': 'Accept-Encoding',
    };

    if (acceptEncoding.includes('gzip')) {
      headers['Content-Encoding'] = 'gzip';
    }

    res.writeHead(200, headers);
    res.end(compressedData);
  } catch (err) {
    if (err.code === 'ENOENT') {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
    } else {
      console.error(err);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('500 Internal Server Error');
    }
  }
}

const routes = {
  '/': (req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Hello World!');
  },
  '/api/time': (req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ time: new Date().toISOString() }));
  },
};

async function handleRequest(req, res) {
  const { method, url } = req;

  if (method === 'GET') {
    if (routes[url]) {
      routes[url](req, res);
    } else if (url.startsWith('/public/')) {
      const filePath = path.join(config.publicDir, url.slice(7));
      await serveStaticFile(req, res, filePath);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
    }
  } else {
    res.writeHead(405, { 'Content-Type': 'text/plain' });
    res.end('405 Method Not Allowed');
  }
}

function errorHandler(err, req, res) {
  console.error(err.stack);
  res.writeHead(500, { 'Content-Type': 'text/plain' });
  res.end('500 Internal Server Error');
}

function createApp() {
  const serverCallback = (req, res) => {
    handleRequest(req, res).catch(err => errorHandler(err, req, res));
  };

  if (config.useHttps && config.httpsOptions.key && config.httpsOptions.cert) {
    return https.createServer(config.httpsOptions, serverCallback);
  } else {
    return http.createServer(serverCallback);
  }
}

export { createApp, config };
