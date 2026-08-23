# Event Booking System API

A scalable backend API for an event booking system supporting
Event Organizers and Customers.

## Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs
- Redis Cloud
- BullMQ

## Features

- User registration and login
- JWT authentication
- Role-based authorization
- Organizer event management
- Public event browsing
- Customer ticket booking
- Atomic ticket reservation
- Booking confirmation background job
- Event update notification background job

## User Roles

### Organizer

- Create events
- Update own events
- Delete own events
- Manage event information

### Customer

- Browse events
- View event details
- Book tickets
- View their bookings

## API Endpoints

### Authentication

POST /api/auth/register
POST /api/auth/login

### Events

GET /api/events
GET /api/events/:id
POST /api/events
PATCH /api/events/:id
DELETE /api/events/:id

### Bookings

POST /api/bookings
GET /api/bookings/my

## Background Jobs

### Booking Confirmation

After a successful booking, a BullMQ job is added to Redis.

The worker processes the job and simulates sending a
booking confirmation email using console output.

### Event Update Notification

When an organizer updates an event, a BullMQ job is created.

The worker finds all confirmed bookings for the event and
simulates notifying each customer using console output.

## Architecture

Client
|
v
Express API
|
+---- MongoDB
|
+---- Redis
|
v
BullMQ
|
v
Worker

The API is stateless and can be horizontally scaled.
Background workers can be scaled independently from API instances.

## Scalability

- JWT-based stateless authentication
- Atomic ticket reservation prevents overbooking
- MongoDB indexes for frequently queried fields
- Redis and BullMQ for asynchronous processing
- Background workers can scale independently
- API instances can be horizontally scaled behind a load balancer

## Environment Variables

PORT=3000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret

REDIS_HOST=your_redis_host
REDIS_PORT=your_redis_port
REDIS_USERNAME=default
REDIS_PASSWORD=your_redis_password

## Running Locally

Install dependencies:

npm install

Start API:

npm run dev

Start background worker:

npm run worker

## Health Check

GET /api/health
