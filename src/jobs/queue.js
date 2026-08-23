import { Queue } from "bullmq";
import redisConnection from "../config/redis.js";

export const bookingQueue = new Queue("booking-confirmation", {
  connection: redisConnection,
});

export const eventNotificationQueue = new Queue("event-notification", {
  connection: redisConnection,
});
