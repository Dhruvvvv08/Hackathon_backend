# 🏟️ Sports Slot Booking System

A RESTful API for booking sports venue time slots, built with **Node.js**, **Express.js**, and **MongoDB (Mongoose)**.

---

## 📁 Project Structure

```
src/
├── config/
│   ├── db.js              # MongoDB connection
│   └── users.js           # Hardcoded users list
├── controllers/
│   ├── venueController.js # Venue & slot logic
│   └── bookingController.js # Booking CRUD logic
├── middleware/
│   ├── authenticate.js    # X-User-Id header auth
│   ├── errorHandler.js    # Global error handler
│   └── validate.js        # Request validation
├── models/
│   ├── Venue.js           # Venue schema
│   └── Booking.js         # Booking schema (with compound index)
├── routes/
│   ├── venueRoutes.js     # Venue endpoints
│   ├── bookingRoutes.js   # Booking endpoints
│   └── userRoutes.js      # User booking endpoints
├── seed/
│   └── seed.js            # Database seed script
├── utils/
│   ├── ApiError.js        # Custom error class
│   ├── asyncHandler.js    # Async error wrapper
│   ├── email.js           # Nodemailer email service
│   └── response.js        # Consistent response builder
├── app.js                 # Express app setup
└── server.js              # Entry point
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18+ 
- **MongoDB Atlas** account (or local MongoDB)
- **Gmail account** with App Password (for email notifications)

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd sports-slot-booking
npm install
```

### 2. Configure Environment

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/sports-booking?retryWrites=true&w=majority
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM="Sports Booking <your-email@gmail.com>"
```

> **Gmail App Password:** Go to [Google Account → Security → App Passwords](https://myaccount.google.com/apppasswords) to generate one. You need 2FA enabled.

### 3. Seed the Database

```bash
npm run seed
```

This creates 5 venues and sets up MongoDB indexes.

### 4. Start the Server

```bash
# Development (auto-restart with nodemon)
npm run dev

# Production
npm start
```

Server runs at `http://localhost:5000`

---

## 🔐 Authentication

This project uses **header-based user identification** (no JWT/OAuth).

Pass the `X-User-Id` header with every authenticated request:

```
X-User-Id: user_1
```

### Available Users

| ID      | Name          | Email                     |
|---------|---------------|---------------------------|
| user_1  | Aarav Sharma  | aarav.sharma@example.com  |
| user_2  | Priya Patel   | priya.patel@example.com   |
| user_3  | Rohan Gupta   | rohan.gupta@example.com   |
| user_4  | Sneha Reddy   | sneha.reddy@example.com   |
| user_5  | Vikram Singh  | vikram.singh@example.com  |

---

## 📡 API Endpoints

### Health Check

```
GET /api/health
```

### Venues

| Method | Endpoint                          | Auth | Description                    |
|--------|-----------------------------------|------|--------------------------------|
| GET    | `/api/venues`                     | No   | List all venues                |
| GET    | `/api/venues/:id/slots?date=YYYY-MM-DD` | No   | Get slot availability for a date |

### Bookings

| Method | Endpoint              | Auth | Description                |
|--------|-----------------------|------|----------------------------|
| POST   | `/api/bookings`       | Yes  | Create a new booking       |
| DELETE | `/api/bookings/:id`   | Yes  | Cancel a booking (owner only) |

### Users

| Method | Endpoint                    | Auth | Description              |
|--------|-----------------------------|------|--------------------------|
| GET    | `/api/users/:id/bookings`   | Yes  | Get user's bookings      |

---

## 📋 API Examples

### Get All Venues

```bash
curl http://localhost:5000/api/venues
```

### Get Slot Availability

```bash
curl "http://localhost:5000/api/venues/<venueId>/slots?date=2025-01-15"
```

### Create a Booking

```bash
curl -X POST http://localhost:5000/api/bookings \
  -H "Content-Type: application/json" \
  -H "X-User-Id: user_1" \
  -d '{
    "venueId": "<venueId>",
    "date": "2025-01-15",
    "startTime": "10:00"
  }'
```

### Cancel a Booking

```bash
curl -X DELETE http://localhost:5000/api/bookings/<bookingId> \
  -H "X-User-Id: user_1"
```

### Get User Bookings

```bash
curl http://localhost:5000/api/users/user_1/bookings \
  -H "X-User-Id: user_1"
```

---

## 📬 Response Format

All API responses follow this structure:

```json
{
  "success": true,
  "message": "Description of the result",
  "data": { }
}
```

### Error Codes

| Code | Meaning                                      |
|------|----------------------------------------------|
| 200  | Success                                      |
| 201  | Created (booking)                            |
| 400  | Bad request / Invalid input                  |
| 401  | Unauthorized (missing/invalid X-User-Id)     |
| 403  | Forbidden (not the booking owner)            |
| 404  | Resource not found                           |
| 409  | Conflict (slot already booked)               |
| 500  | Internal server error                        |

---

## 🔒 Concurrency Safety

Double bookings are prevented using a **MongoDB unique compound index** with a partial filter:

```javascript
{ venueId: 1, date: 1, startTime: 1 }
// Only applied where status === 'booked'
```

When two concurrent requests try to book the same slot, one will succeed and the other will receive a `409 Conflict` response.

---

## 📧 Email Notifications

- **Booking confirmation** emails are sent after a successful booking.
- **Cancellation** emails are sent after a booking is cancelled.
- Emails are sent **non-blocking** — a failed email will not affect the API response.
- Configure Gmail SMTP in `.env` (see setup instructions above).

---

## 🏟️ Seeded Venues

| Venue Name     | Sport     |
|----------------|-----------|
| Shuttle Arena  | Badminton |
| Green Turf     | Football  |
| Cricket Hub    | Cricket   |
| Smash Court    | Badminton |
| Goal Zone      | Football  |

**Slots:** 16 hourly slots from **6:00 AM** to **10:00 PM** (06:00 – 22:00).

---

## 🧪 Postman Collection

Import `postman_collection.json` into Postman to test all endpoints.

**Setup:**
1. Import the collection file.
2. The `baseUrl` variable defaults to `http://localhost:5000/api`.
3. Run "Get All Venues" first — it auto-sets the `venueId` variable.
4. Run "Create Booking" — it auto-sets the `bookingId` variable.

---

## 📜 License

ISC
