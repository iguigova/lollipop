import { createApp, config } from '../app.mjs';
import supertest from 'supertest';
import { generateTestCertificate, cleanupTestCertificates, mockEnv } from './test.mjs';

describe('App', () => {
  let app;
  let request;

  mockEnv({
    HTTP_PORT: '3000',
    HTTPS_PORT: '3443',
    USE_HTTPS: 'false',
    PUBLIC_DIR: './public'
  });

  beforeAll(async () => {
    const { httpServer } = await createApp();
    app = httpServer;
    request = supertest(app);
  });

  test('GET / returns Hello World', async () => {
    const response = await request.get('/');
    expect(response.status).toBe(200);
    expect(response.text).toBe('Hello World!');
  });

  describe('HTTPS', () => {
    let httpsApp;
    let httpsRequest;

    beforeAll(async () => {
      const { keyPath, certPath } = await generateTestCertificate();
      console.log('Test certificates generated:', { keyPath, certPath });

      mockEnv({
        USE_HTTPS: 'true',
        HTTPS_KEY_PATH: keyPath,
        HTTPS_CERT_PATH: certPath
      });

      const { httpsServer } = await createApp();
      console.log('HTTPS server created:', httpsServer ? 'Yes' : 'No');

      httpsApp = httpsServer;
      httpsRequest = supertest(httpsApp);
    });

    afterAll(async () => {
      await cleanupTestCertificates();
    });

    test('HTTPS GET / returns Hello World', async () => {
      console.log('HTTPS app available:', httpsApp ? 'Yes' : 'No');
      const response = await httpsRequest.get('/');
      expect(response.status).toBe(200);
      expect(response.text).toBe('Hello World!');
    });
  });
});
