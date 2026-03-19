const cron = require("node-cron");
const Recette = require("../models/recette");

// Tâche 1 : Modération YouTube toutes les 30 minutes
cron.schedule("*/30 * * * *", async () => {
  console.log(" [CRON] Vérification de la modération YouTube...");
  try {
  } catch (err) {
    console.error("Erreur Cron Moderation:", err);
  }
});

// Tâche 2 : Nettoyage quotidien à 3h du matin
cron.schedule("0 3 * * *", async () => {
  console.log(" [CRON] Nettoyage des fichiers orphelins...");
});

console.log("✅ Système de tâches CRON démarré.");
