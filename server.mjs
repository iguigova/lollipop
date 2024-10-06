import parseEnv from './utils/env.mjs';
import { createApp } from './app.mjs';

// Parse .env file and set environment variables
parseEnv();

async function startServer() {
  try {
    const { httpServer, httpsServer, config } = await createApp();

    httpServer.listen(config.httpPort, () => {
      console.log(`HTTP server running on port ${config.httpPort}`);
    });

    if (httpsServer) {
      httpsServer.listen(config.httpsPort, () => {
        console.log(`HTTPS server running on port ${config.httpsPort}`);
      });
    }

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM signal received: closing HTTP server');
      httpServer.close(() => {
        console.log('HTTP server closed');
      });
      if (httpsServer) {
        httpsServer.close(() => {
          console.log('HTTPS server closed');
        });
      }
    });

  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Application specific logging, throwing an error, or other logic here
});
