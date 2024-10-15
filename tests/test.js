import { promisify } from 'util';
import { exec } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const execAsync = promisify(exec);

export async function generateTestCertificate() {
  const keyPath = path.join(__dirname, '..', '.ssh', 'test_key.pem');
  const certPath = path.join(__dirname, '..', '.ssh', 'test_cert.pem');
  
  const command = `openssl req -x509 -newkey rsa:4096 -keyout ${keyPath} -out ${certPath} -days 1 -nodes -subj "/CN=localhost"`;
  
  try {
    await execAsync(command);
    return { keyPath, certPath };
  } catch (error) {
    console.error('Failed to generate test certificate:', error);
    throw error;
  }
}

export async function cleanupTestCertificates() {
  const keyPath = path.join(__dirname, '..', '.ssh', 'test_key.pem');
  const certPath = path.join(__dirname, '..', '.ssh', 'test_cert.pem');
  
  try {
    await fs.unlink(keyPath);
    await fs.unlink(certPath);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.error('Error cleaning up test certificates:', error);
    }
  }
}

export function setTestEnv(envVars) {
  const originalEnv = { ...process.env };
  Object.assign(process.env, envVars);
  return () => {
    process.env = originalEnv;
  };
}
