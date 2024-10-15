import { jest } from '@jest/globals';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import parseEnv from '../../dist/utils/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('parseEnv', () => {
  const originalEnv = process.env;
  const testEnvPath = path.join(__dirname, '..', '..', '.env.test');

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(async () => {
    try {
      await fs.unlink(testEnvPath);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.error('Error cleaning up test .env file:', error);
      }
    }
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  test('should parse environment variables correctly', async () => {
    const testEnvContent = `
      TEST_VAR1=value1
      TEST_VAR2=value2
      # This is a comment
      TEST_VAR3=value3 with spaces
    `;

    await fs.writeFile(testEnvPath, testEnvContent);

    parseEnv(testEnvPath);

    expect(process.env.TEST_VAR1).toBe('value1');
    expect(process.env.TEST_VAR2).toBe('value2');
    expect(process.env.TEST_VAR3).toBe('value3 with spaces');
    expect(process.env.TEST_VAR4).toBeUndefined();
  });

  test('should handle non-existent .env file', () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

    parseEnv(testEnvPath);

    expect(consoleWarnSpy).toHaveBeenCalledWith('No .env file found. Using default environment variables.');

    consoleWarnSpy.mockRestore();
  });
});
