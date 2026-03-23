// require("dotenv").config({ path: "./.env" });
const cron = require("node-cron");
const Recette = require("../models/recette");
const youtube = require("../utils/youtubeConfig");
const { videoQueue } = require("../utils/videoQueue");

// Tâche 1 : Modération YouTube toutes les 5 minutes
cron.schedule("*/5 * * * *", async () => {
  console.log(" [CRON] Vérification de la modération YouTube...");
  try {
    const recettes = await Recette.findPublished();
    if (recettes.length === 0) {
      console.log(" [CRON] Aucune recette publiée à vérifier.");
      return;
    }
    console.log(` [CRON] ${recettes.length} recette(s) à contrôler.`);
    for (const recette of recettes) {
      const response = await youtube.videos.list({
        part: "status,contentDetails",
        id: recette.youtube,
      });
      const video = response.data.items[0];

      // 1. Si la vidéo n'existe plus (supprimée par l'user ou YouTube)
      if (!video) {
        console.warn(
          ` [ALERT] Vidéo introuvable pour la recette ${recette.id}. Passage en erreur.`,
        );
        await Recette.updateStatusError(recette.id);
        continue;
      }
      const { uploadStatus, rejectionReason } = video.status;

      // 2. Vérification du rejet (Droits d'auteur / Contenu)
      if (uploadStatus === "rejected") {
        console.error(
          ` [REJET] La vidéo ${recette.id} a été rejetée. Raison : ${rejectionReason}`,
        );

        await videoQueue.add("cleanup-media", {
          action: "DELETE",
          recetteId: recette.id,
          oldS3Name: recette.imageName,
          oldYoutubeId: recette.youtube,
        });
        await Recette.delete(recette.id);
      } else {
        await Recette.updateStatusValidate(recette.id);
        console.log(
          ` [OK] Vidéo ${recette.id} conforme (Status: ${uploadStatus}).`,
        );
      }
    }
  } catch (err) {
    console.error("Erreur Cron Moderation:", err);
  }
});

// Tâche 2 : Nettoyage quotidien à 3h du matin
// cron.schedule("0 3 * * *", async () => {
//   console.log(" [CRON] Nettoyage des fichiers orphelins...");
// });

console.log("Système de tâches CRON démarré.");
