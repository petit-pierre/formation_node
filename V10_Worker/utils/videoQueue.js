// npm install bullmq
// npm install ioredis

const { Queue } = require("bullmq");
const ioredis = require("ioredis");

require("dotenv").config({ path: "../.env" });

// 1. Configuration de la connexion Redis
// On utilise ioredis pour une gestion fine de la connexion
const redisConnection = new ioredis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT || 6379,
  // Indispensable pour BullMQ : permet de ne pas bloquer les requêtes
  maxRetriesPerRequest: null,
});

redisConnection.on("error", (err) => {
  console.error("Erreur de connexion Redis:", err);
});

// 2. Création de la Queue (File d'attente)
// Le nom 'video-processing' est la "boîte aux lettres" partagée
const videoQueue = new Queue("video-processing", {
  connection: redisConnection,
  defaultJobOptions: {
    // Options par défaut pour tous les jobs de cette file
    attempts: 3, // Nombre d'essais en cas d'échec
    backoff: {
      type: "exponential",
      delay: 5000, // Attend 5s, puis 10s, puis 20s...
    },
    removeOnComplete: true, // Nettoie Redis une fois fini pour gagner de la RAM
    removeOnFail: false, // Garde les erreurs pour pouvoir les inspecter
  },
});

module.exports = {
  videoQueue,
  connection: redisConnection, // On l'exporte aussi pour que le Worker puisse s'y brancher
};
