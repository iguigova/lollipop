import path from 'path';
import { serveStaticFile } from './utils/files.js';
import { renderToString } from 'react-dom/server';
import React from 'react';
import { HomePage, TimePage } from './components/home.js';

export default async function handleRoutes(req, res, config) {
    const { method, url } = req;
    
    if (method === 'GET') {
        if (url === '/') {
            const html = renderToString(<HomePage />);
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(html);
        } else if (url === '/api/time') {
            // res.writeHead(200, { 'Content-Type': 'application/json' });
            // res.end(JSON.stringify({ time: new Date().toISOString() }));
            const time = new Date().toISOString();
            const html = renderToString(<TimePage time={time} />);
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(html);
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
