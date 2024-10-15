import { jest } from '@jest/globals';
import supertest from 'supertest';
import http from 'http';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import handleRoutes from '../src/routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Routes', () => {
  let server;
  let request;
  const mockConfig = {
    publicDir: path.join(__dirname, '..', 'public')
  };

  beforeAll(async () => {
    await new Promise(resolve => {
      server = http.createServer((req, res) => handleRoutes(req, res, mockConfig));
      server.listen(0, () => {
        request = supertest(server);
        resolve();
      });
    });
  });

  afterAll(async () => {
    await new Promise(resolve => server.close(resolve));
  });

  test('GET / returns Hello World', async () => {
    const response = await request.get('/');
    expect(response.status).toBe(200);
    expect(response.text).toBe('Hello World!');
  });

  test('GET /api/time returns current time', async () => {
    const response = await request.get('/api/time');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('time');
    expect(new Date(response.body.time)).toBeInstanceOf(Date);
  });

  test('GET /public/test.txt serves static file', async () => {
    await fs.mkdir(mockConfig.publicDir, { recursive: true });
    
    const testFilePath = path.join(mockConfig.publicDir, 'test.txt');
    const testContent = 'This is a test file';
    
    try {
      await fs.writeFile(testFilePath, testContent);

      const response = await request.get('/public/test.txt');
      expect(response.status).toBe(200);
      expect(response.text).toBe(testContent);
    } finally {
      await fs.unlink(testFilePath).catch(() => {});
    }
  });

  test('GET /nonexistent returns 404', async () => {
    const response = await request.get('/nonexistent');
    expect(response.status).toBe(404);
    expect(response.text).toBe('404 Not Found');
  });

  test('POST / returns 405 Method Not Allowed', async () => {
    const response = await request.post('/');
    expect(response.status).toBe(405);
    expect(response.text).toBe('405 Method Not Allowed');
  });
});
