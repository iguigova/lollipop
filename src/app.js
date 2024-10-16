import http from 'http';
import https from 'https';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import handleRoutes from './routes.js';
import parseEnv from './utils/env.js';
import asyncLog from './utils/logs.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getConfig() {
  return {
    httpPort: parseInt(process.env.HTTP_PORT || '3000', 10),
    httpsPort: parseInt(process.env.HTTPS_PORT || '3443', 10),
    publicDir: process.env.PUBLIC_DIR || path.join(__dirname, 'public'),
    useHttps: process.env.USE_HTTPS === 'true',
    httpsOptions: {
      key: process.env.HTTPS_KEY_PATH,
      cert: process.env.HTTPS_CERT_PATH,
    },
  };
}

async function createApp() {
  // Call parseEnv at the beginning of createApp
  await parseEnv();

  const config = getConfig();
  asyncLog('Creating app with config:', JSON.stringify(config, null, 2));

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
      asyncLog('HTTPS key path:', config.httpsOptions.key);
      asyncLog('HTTPS cert path:', config.httpsOptions.cert);
      
      if (!config.httpsOptions.key || !config.httpsOptions.cert) {
        throw new Error('HTTPS key or cert path is missing');
      }
      
      const key = await fs.readFile(config.httpsOptions.key);
      asyncLog('HTTPS key read successfully');
      
      const cert = await fs.readFile(config.httpsOptions.cert);
      asyncLog('HTTPS cert read successfully');
      
      httpsServer = https.createServer({ key, cert }, (req, res) => {
        handleRoutes(req, res, config).catch(err => {
          console.error('Error handling request:', err);
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('500 Internal Server Error');
        });
      });
      asyncLog('HTTPS server created successfully');
    } catch (err) {
      console.error('Error creating HTTPS server:', err);
      console.error('HTTPS server creation failed, continuing without HTTPS');
    }
  } else {
    asyncLog('HTTPS server not created (USE_HTTPS is false)');
  }

  return { httpServer, httpsServer, config };
}

export { createApp };
