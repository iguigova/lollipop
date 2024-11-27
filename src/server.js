import { httpServer, httpsServer } from './app.js';
import pool from './db.js';
import config from './config.js';

async function startServer() {
    try {       
        httpServer.listen(config.httpPort, () => {
            console.log(`HTTP server running on port ${config.httpPort}`);
        });
        
        if (httpsServer) {
            httpsServer.listen(config.httpsPort, () => {
                console.log(`HTTPS server running on port ${config.httpsPort}`);
            });
        }
        
        // Graceful shutdown
        process.on("SIGTERM", () => {
            console.log("SIGTERM signal received: starting graceful shutdown");
            
            const dbShutdown = pool.end()
                  .then(() => console.log("Database connections closed"))
                  .catch(err => console.error("Error closing database connections:", err));
            
            const httpShutdown = httpServer.close()
                  .then(() => console.log("HTTP server closed"))
                  .catch(err => console.error("Error closing HTTP server:", err));
            
            const httpsShutdown = httpsServer 
                  ? httpsServer.close()
                  .then(() => console.log("HTTPS server closed"))
                  .catch(err => console.error("Error closing HTTPS server:", err))
                  : Promise.resolve();
            
            Promise.allSettled([dbShutdown, httpShutdown, httpsShutdown])
                .then(() => console.log("Graceful shutdown completed"));
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
