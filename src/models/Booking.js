const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: [true, 'User ID is required'],
      trim: true,
    },
    venueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Venue',
      required: [true, 'Venue ID is required'],
    },
    date: {
      type: String, // Format: YYYY-MM-DD
      required: [true, 'Booking date is required'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'],
    },
    startTime: {
      type: String, // Format: HH:00 (e.g., "06:00", "21:00")
      required: [true, 'Start time is required'],
      match: [/^\d{2}:00$/, 'Start time must be in HH:00 format'],
    },
    endTime: {
      type: String, // Auto-calculated: startTime + 1 hour
      required: [true, 'End time is required'],
      match: [/^\d{2}:00$/, 'End time must be in HH:00 format'],
    },
    status: {
      type: String,
      enum: {
        values: ['booked', 'cancelled'],
        message: '{VALUE} is not a valid status',
      },
      default: 'booked',
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

/**
 * Unique compound index to prevent double booking.
 * Only active (non-cancelled) bookings are considered via a partial filter.
 * This is the primary concurrency-safety mechanism.
 */
bookingSchema.index(
  { venueId: 1, date: 1, startTime: 1 },
  {
    unique: true,
    partialFilterExpression: { status: 'booked' },
    name: 'unique_active_booking',
  }
);

// Index for querying user bookings efficiently
bookingSchema.index({ userId: 1, createdAt: -1 });

// Index for querying venue slots on a date
bookingSchema.index({ venueId: 1, date: 1, status: 1 });

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
