const express = require('express');
const { getAllVenues, getVenueSlots } = require('../controllers/venueController');
const validate = require('../middleware/validate');

const router = express.Router();

/**
 * GET /api/venues
 * List all venues.
 */
router.get('/', getAllVenues);

/**
 * GET /api/venues/:id/slots?date=YYYY-MM-DD
 * List hourly slots with availability for a venue on a given date.
 */
router.get(
  '/:id/slots',
  validate([
    {
      field: 'date',
      location: 'query',
      required: true,
      pattern: /^\d{4}-\d{2}-\d{2}$/,
      message: 'date query parameter is required and must be in YYYY-MM-DD format',
    },
  ]),
  getVenueSlots
);

module.exports = router;
