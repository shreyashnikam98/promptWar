const dotenv = require('dotenv');
dotenv.config();

const app = require('./app');
const { connectDB } = require('./config/db');
const { seedDatabaseIfEmpty } = require('./utils/seedData');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDB();

    // Auto-seed if database is empty so demonstrations work immediately
    await seedDatabaseIfEmpty();

    const server = app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(` City Life Server running on http://localhost:${PORT}`);
      console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(` Health check: http://localhost:${PORT}/api/health`);
      console.log(`=======================================================`);
    });

    // Handle termination
    process.on('SIGTERM', () => {
      console.log('SIGTERM received. Shutting down gracefully.');
      server.close(() => {
        console.log('Process terminated.');
      });
    });
  } catch (err) {
    console.error('Fatal Server Boot Error:', err);
    process.exit(1);
  }
}

startServer();
