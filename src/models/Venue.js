const mongoose = require('mongoose');

const venueSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Venue name is required'],
      trim: true,
      unique: true,
    },
    sport: {
      type: String,
      required: [true, 'Sport type is required'],
      trim: true,
      enum: {
        values: ['Badminton', 'Football', 'Cricket'],
        message: '{VALUE} is not a supported sport',
      },
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Index on sport for filtered queries
venueSchema.index({ sport: 1 });

const Venue = mongoose.model('Venue', venueSchema);

module.exports = Venue;
