import fs from 'fs/promises';
import path from 'path';
import zlib from 'zlib';
import { promisify } from 'util';

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
  '.txt': 'text/plain',
};

async function compressData(data, acceptEncoding) {
  if (acceptEncoding.includes('gzip')) {
    return gzip(data);
  }
  return data;
}

export async function serveStaticFile(req, res, filePath) {
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
