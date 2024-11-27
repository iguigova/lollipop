import http from 'http';
import https from 'https';
import fs from 'fs/promises';
import config from './config.js';
import handleRoutes from './routes.js';
import asyncLog from './utils/logs.js';

const httpServer = http.createServer((req, res) => {
  handleRoutes(req, res, config).catch(err => {
    console.error('Error handling request:', err);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('500 Internal Server Error');
  });
});

let httpsServer = null;

if (config.useHttps) {
  try {
    asyncLog('Attempting to create HTTPS server');
    const key = await fs.readFile(config.httpsOptions.key);
    const cert = await fs.readFile(config.httpsOptions.cert);
    
    httpsServer = https.createServer({ key, cert }, (req, res) => {
      handleRoutes(req, res, config).catch(err => {
        console.error('Error handling request:', err);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 Internal Server Error');
      });
    });
    asyncLog('HTTPS server created successfully');
  } catch (err) {
    console.error('HTTPS server creation failed:', err);
  }
}

export { httpServer, httpsServer };
