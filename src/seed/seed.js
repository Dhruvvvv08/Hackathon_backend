require('dotenv').config();
const mongoose = require('mongoose');
const Venue = require('../models/Venue');
const Booking = require('../models/Booking');

/**
 * Seed data: 5 venues with different sports.
 */
const venues = [
  { name: 'Shuttle Arena', sport: 'Badminton' },
  { name: 'Green Turf', sport: 'Football' },
  { name: 'Cricket Hub', sport: 'Cricket' },
  { name: 'Smash Court', sport: 'Badminton' },
  { name: 'Goal Zone', sport: 'Football' },
];

const seed = async () => {
  try {
    console.log('🌱 Starting seed process...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Clear existing data
    await Booking.deleteMany({});
    console.log('🗑️  Cleared bookings collection');

    await Venue.deleteMany({});
    console.log('🗑️  Cleared venues collection');

    // Insert venues
    const createdVenues = await Venue.insertMany(venues);
    console.log(`\n✅ Seeded ${createdVenues.length} venues:`);
    createdVenues.forEach((v) => {
      console.log(`   • ${v.name} (${v.sport}) — ID: ${v._id}`);
    });

    // Ensure indexes are built
    await Venue.syncIndexes();
    await Booking.syncIndexes();
    console.log('\n✅ Indexes synchronized');

    console.log('\n🎉 Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  }
};

seed();
