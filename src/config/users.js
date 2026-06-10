/**
 * Hardcoded users list.
 * In this system, there is no JWT/OAuth — the current user is identified
 * via the X-User-Id request header and validated against this array.
 */
const users = [
  {
    id: 'user_1',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@example.com',
  },
  {
    id: 'user_2',
    name: 'Priya Patel',
    email: 'priya.patel@example.com',
  },
  {
    id: 'user_3',
    name: 'Rohan Gupta',
    email: 'rohan.gupta@example.com',
  },
  {
    id: 'user_4',
    name: 'Sneha Reddy',
    email: 'sneha.reddy@example.com',
  },
  {
    id: 'user_5',
    name: 'Vikram Singh',
    email: 'vikram.singh@example.com',
  },
];

module.exports = users;
