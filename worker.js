import "dotenv/config";
import { Worker } from "bullmq";
import User from "./src/models/User.js";
import redisConnection from "./src/config/redis.js";
import connectDB from "./src/config/db.js";
import Booking from "./src/models/Booking.js";

const startWorker = async () => {
  // Worker is a separate process, so it needs its own DB connection
  await connectDB();

  console.log("Worker connected to MongoDB");

  // Background Task 1:
  // Booking confirmation
  const bookingWorker = new Worker(
    "booking-confirmation",
    async (job) => {
      const { bookingId, customerId, eventId } = job.data;

      console.log("\n[EMAIL] Booking confirmation sent successfully");

      console.log(`Booking ID: ${bookingId}`);
      console.log(`Customer ID: ${customerId}`);
      console.log(`Event ID: ${eventId}\n`);
    },
    {
      connection: redisConnection,
    },
  );

  // Background Task 2:
  // Event update notification
  const eventNotificationWorker = new Worker(
    "event-notification",
    async (job) => {
      const { eventId } = job.data;

      const bookings = await Booking.find({
        event: eventId,
        status: "CONFIRMED",
      }).populate("customer", "name email");

      console.log(`\n[EVENT UPDATE] Event ${eventId} was updated`);

      if (bookings.length === 0) {
        console.log("No customers to notify.\n");
        return;
      }

      for (const booking of bookings) {
        console.log(
          `[NOTIFICATION] Sent event update to ${booking.customer.email}`,
        );
      }

      console.log(`Total customers notified: ${bookings.length}\n`);
    },
    {
      connection: redisConnection,
    },
  );

  bookingWorker.on("completed", (job) => {
    console.log(`Booking confirmation job completed: ${job.id}`);
  });

  bookingWorker.on("failed", (job, error) => {
    console.error(`Booking confirmation job failed: ${job?.id}`, error.message);
  });

  eventNotificationWorker.on("completed", (job) => {
    console.log(`Event notification job completed: ${job.id}`);
  });

  eventNotificationWorker.on("failed", (job, error) => {
    console.error(`Event notification job failed: ${job?.id}`, error.message);
  });

  console.log("Workers started...");
};

startWorker().catch((error) => {
  console.error("Worker startup failed:", error);
  process.exit(1);
});
