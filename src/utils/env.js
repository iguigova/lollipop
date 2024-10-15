import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function parseEnv(customPath = null) {
  const envPath = customPath || path.join(__dirname, '../..', '.env');
  try {
    const envContents = fs.readFileSync(envPath, 'utf-8');
    
    envContents.split('\n').forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, value] = trimmedLine.split('=');
        if (key && value) {
          process.env[key.trim()] = value.trim();
        }
      }
    });
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.warn('No .env file found. Using default environment variables.');
    } else {
      console.error('Error reading .env file:', error);
    }
  }
}

export default parseEnv;
