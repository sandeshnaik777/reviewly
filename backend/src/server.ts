import { createApp } from './app.js';
import { config } from './config/index.js';

const app = createApp();

const server = app.listen(config.port, () => {
  console.log(`====================================================`);
  console.log(`  Reviewly: Business Review Platform (Multi-Tenant) `);
  console.log(`  API Server running on port ${config.port}`);
  console.log(`  Environment: ${config.nodeEnv}`);
  console.log(`  API Base URL: ${config.apiBaseUrl}`);
  console.log(`====================================================`);
});

// Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received. Closing HTTP server gracefully...');
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received. Closing HTTP server gracefully...');
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
});
