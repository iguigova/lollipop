import { createApp, config } from './app.mjs';

const server = createApp();

server.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
  console.log(`HTTPS: ${config.useHttps ? 'Enabled' : 'Disabled'}`);
  console.log(`Public directory: ${config.publicDir}`);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Application specific logging, throwing an error, or other logic here
});
