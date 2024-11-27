import pg from 'pg';
import config from './config.js';

const pool = new pg.Pool({
  user: config.db.user,
  host: config.db.host,
  database: config.db.database,
  password: config.db.password,
  port: config.db.port,
  max: config.db.pool.max,
  idleTimeoutMillis: config.db.pool.idleTimeoutMillis,
  connectionTimeoutMillis: config.db.pool.connectionTimeoutMillis,
});

// Test the connection
try {
  const client = await pool.connect();
  await client.query('SELECT NOW()');
  client.release();
  console.log('Successfully connected to PostgreSQL');
} catch (err) {
  console.error('Failed to connect to PostgreSQL:', err);
  throw err;
}

export default pool;
