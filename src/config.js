import path from 'path';
import { fileURLToPath } from 'url';
import parseEnv from './env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
await parseEnv();

// Export the config object directly
export default {
  httpPort: parseInt(process.env.HTTP_PORT || '3000', 10),
  httpsPort: parseInt(process.env.HTTPS_PORT || '3443', 10),
  publicDir: process.env.PUBLIC_DIR || path.join(__dirname, 'public'),
  useHttps: process.env.USE_HTTPS === 'true',
  httpsOptions: {
    key: process.env.HTTPS_KEY_PATH,
    cert: process.env.HTTPS_CERT_PATH,
  },
  db: {
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST || 'localhost',
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
    pool: {
      max: parseInt(process.env.POSTGRES_POOL_MAX || '20', 10),
      idleTimeoutMillis: parseInt(process.env.POSTGRES_IDLE_TIMEOUT || '30000', 10),
      connectionTimeoutMillis: parseInt(process.env.POSTGRES_CONNECT_TIMEOUT || '2000', 10),
    }
  }
};
