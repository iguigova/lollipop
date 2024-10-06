import path from 'path';
import { serveStaticFile } from './utils/files.mjs';

export default async function handleRoutes(req, res, config) {
  const { method, url } = req;

  if (method === 'GET') {
    if (url === '/') {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('Hello World!');
    } else if (url === '/api/time') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ time: new Date().toISOString() }));
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
