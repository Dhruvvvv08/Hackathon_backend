require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

/**
 * Start the server after establishing a database connection.
 */
const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`\n Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log(`   Health check: http://localhost:${PORT}/api/health\n`);
  });
};

startServer();
