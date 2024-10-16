import { createApp } from '../dist/app.js';
import supertest from 'supertest';
import { generateTestCertificate, cleanupTestCertificates, setTestEnv } from './test.js';

describe('App', () => {
  let app;
  let request;
  let restoreEnv;

  beforeAll(async () => {
    restoreEnv = setTestEnv({
      HTTP_PORT: '3000',
      HTTPS_PORT: '3443',
      USE_HTTPS: 'false',
      PUBLIC_DIR: './public'
    });

    const { httpServer } = await createApp();
    app = httpServer;
    request = supertest(app);
  });

  afterAll(() => {
    restoreEnv();
    app.close();
  });

  test('GET / returns Hello World', async () => {
    const response = await request.get('/');
    expect(response.status).toBe(200);
    expect(response.text).toContain('<html>');
  });

  test('GET /api/time returns current time', async () => {
    const response = await request.get('/api/time');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('time');
    expect(new Date(response.body.time)).toBeInstanceOf(Date);
  });

  test('GET /nonexistent returns 404', async () => {
    const response = await request.get('/nonexistent');
    expect(response.status).toBe(404);
    expect(response.text).toBe('404 Not Found');
  });
});

describe('HTTPS App', () => {
  let httpsApp;
  let httpsRequest;
  let restoreEnv;

  beforeAll(async () => {
    try {
      const { keyPath, certPath } = await generateTestCertificate();
      //console.log('Test certificates generated:', { keyPath, certPath });

      restoreEnv = setTestEnv({
        HTTP_PORT: '3000',
        HTTPS_PORT: '3443',
        USE_HTTPS: 'true',
        HTTPS_KEY_PATH: keyPath,
        HTTPS_CERT_PATH: certPath,
        PUBLIC_DIR: './public'
      });

      //console.log('Environment variables set:', JSON.stringify(process.env, null, 2));

      const { httpsServer } = await createApp();

      if (!httpsServer) {
        throw new Error('HTTPS server was not created');
      }

      httpsApp = httpsServer;
      httpsRequest = supertest(httpsApp);
    } catch (error) {
      console.error('Error in beforeAll:', error);
    }
  });

  afterAll(async () => {
    restoreEnv();
    if (httpsApp) {
      await new Promise((resolve) => httpsApp.close(resolve));
    }
    await cleanupTestCertificates();
  });

  test('HTTPS GET / returns Hello World', async () => {
    const response = await httpsRequest.get('/').trustLocalhost(true);
    expect(response.status).toBe(200);
    expect(response.text).toContain('<html>');
  });
});
