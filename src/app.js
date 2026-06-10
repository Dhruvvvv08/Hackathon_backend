const express = require('express');
const venueRoutes = require('./routes/venueRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const userRoutes = require('./routes/userRoutes');
const errorHandler = require('./middleware/errorHandler');
const buildResponse = require('./utils/response');

const app = express();

// ─── Body Parsing ───────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Health Check ───────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json(
    buildResponse(true, 'Server is running', {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    })
  );
});

// ─── API Routes ─────────────────────────────────────────────────
app.use('/api/venues', venueRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/users', userRoutes);

// ─── 404 Handler ────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json(buildResponse(false, `Route not found: ${req.method} ${req.originalUrl}`));
});

// ─── Global Error Handler ───────────────────────────────────────
app.use(errorHandler);

module.exports = app;
