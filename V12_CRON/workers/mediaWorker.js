require("dotenv").config({ path: "./.env" });
const { Worker } = require("bullmq");
const fs = require("fs");
const { connection } = require("../utils/videoQueue");
const youtube = require("../utils/youtubeConfig");
const client = require("../utils/s3Config");
const { PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const Recette = require("../models/recette");

const worker = new Worker(
  "video-processing",
  async (job) => {
    console.log(
      `Traitement du job ${job.id} (Recette ${job.data.recetteId})...`,
    );
    switch (job.data.action) {
      case "DELETE":
        await deletteMedia(job);
        break;
      case "UPDATE":
        await deletteMedia(job);
        await addMedia(job);
        break;
      case "CREATE":
        await addMedia(job);
        break;
      default:
        throw new Error(`Action inconnue: ${job.data.action}`);
    }
  },
  { connection },
);

const deletteMedia = async (job) => {
  const { oldYoutubeId, oldS3Name } = job.data;
  try {
    if (oldYoutubeId) {
      console.log("Suppression de la vidéo YouTube...");
      await youtube.videos.delete({ id: oldYoutubeId });
    }
    if (oldS3Name) {
      console.log("Suppression de l'image S3...");
      await client.send(
        new DeleteObjectCommand({
          Bucket: "paris",
          Key: "grp5/" + oldS3Name,
        }),
      );
    }
  } catch (error) {
    console.error(`Erreur lors de la suppression du média:`, error.message);
  }
};

const addMedia = async (job) => {
  const { recetteId, filePath, fileName, mimetype, title } = job.data;
  let success = true;
  try {
    let youtubeId = null;
    // UPLOAD VERS S3
    console.log("Upload vers S3...");
    await client.send(
      new PutObjectCommand({
        Bucket: "paris",
        Key: `grp5/${fileName}`,
        Body: fs.createReadStream(filePath),
        ContentType: mimetype,
      }),
    );
    // LOGIQUE VIDÉO (YOUTUBE)
    if (mimetype.startsWith("video/") && job.attemptsMade < 1) {
      console.log("Upload vers YouTube...");
      const response = await youtube.videos.insert({
        part: "snippet,status",
        requestBody: {
          snippet: {
            title: title || "Nouvelle Recette",
            description: "Vidéo uploadée via API",
            categoryId: "22",
          },
          status: { privacyStatus: "unlisted" },
        },
        media: {
          body: fs.createReadStream(filePath),
        },
      });
      youtubeId = response.data.id;
    }
    // 3. BDD via le MODELE
    await Recette.updateMediaSuccess(recetteId, {
      imageName: fileName,
      youtubeId,
    });
    return { success: true };
  } catch (error) {
    console.error(`Erreur Job ${job.id}:`, error.message);
    // BDD via le MODELE
    await Recette.updateStatusError(recetteId);
    success = false;
    throw error;
  } finally {
    if (job.attemptsMade > 1 || success) {
      try {
        fs.unlinkSync(filePath);
      } catch (e) {
        console.error("Erreur suppression finale:", e.message);
      }
    }
  }
};

console.log("Worker prêt à traiter les médias...");
