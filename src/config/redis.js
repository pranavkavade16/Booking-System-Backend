import "dotenv/config";
import IORedis from "ioredis";

const redisConnection = new IORedis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,

  // Required by BullMQ
  maxRetriesPerRequest: null,
});

redisConnection.on("connect", () => {
  console.log("Redis connected");
});

redisConnection.on("ready", () => {
  console.log("Redis ready");
});

redisConnection.on("error", (error) => {
  console.error("Redis error:", error.message);
});

export default redisConnection;
