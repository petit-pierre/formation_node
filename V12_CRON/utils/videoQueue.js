require("dotenv").config({ path: "./.env" });
const { Queue } = require("bullmq");
const ioredis = require("ioredis");

const redisConnection = new ioredis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: null,
});

redisConnection.on("error", (err) => {
  console.error("Erreur de connexion Redis:", err);
});

const videoQueue = new Queue("video-processing", {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

module.exports = {
  videoQueue,
  connection: redisConnection,
};
