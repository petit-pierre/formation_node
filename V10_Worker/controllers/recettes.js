const connexion = require("../utils/db");
require("dotenv").config({ path: "../.env" });
const { S3Client, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { recetteSchema } = require("../validator/recette");

const client = new S3Client({
  region: process.env.SCALEWAY_REGION,
  endpoint: process.env.SCALEWAY_ENDPOINT,
  credentials: {
    accessKeyId: process.env.SCALEWAY_ACCESS_KEY,
    secretAccessKey: process.env.SCALEWAY_SECRET_KEY,
  },
});

// Configuration du client OAuth2 pour YouTube (suppression de video)

const { google } = require("googleapis");

const oauth2Client = new google.auth.OAuth2(
  process.env.YOUTUBE_CLIENT_ID,
  process.env.YOUTUBE_CLIENT_SECRET,
  process.env.YOUTUBE_REDIRECT_URI,
);

oauth2Client.setCredentials({
  refresh_token: process.env.YOUTUBE_REFRESH_TOKEN,
});

const youtube = google.youtube({
  version: "v3",
  auth: oauth2Client,
});

exports.optionsRecettes = (req, res) => {
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS",
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.status(200).json({
    "post /":
      "poster une recette, cette route est sécurisée par authentification",
    "get /:id": "récupérer une recette par son id",
    "get /": "récupérer toutes les recettes",
    "put /:id":
      "mettre à jour une recette par son id, cette route est sécurisée par authentification",
    "delete /:id":
      "supprimer une recette par son id, cette route est sécurisée par authentification",
  });
};

exports.createRecettes = async (req, res, next) => {
  try {
    const recetteObject = JSON.parse(req.body.recette);
    const userId = req.auth.userId;
    const validation = recetteSchema.safeParse(recetteObject);
    if (!validation.success) {
      const formattedErrors = {};
      validation.error.issues.forEach((issue) => {
        formattedErrors[issue.path[0]] = issue.message;
      });

      return res.status(400).json({ errors: formattedErrors });
    }
    let { title, description, imageUrl, etapes, imageName } = validation.data;

    let etapesJson = JSON.stringify(etapes) || "[]";
    if (req.file) {
      imageUrl = req.fileUrl;
      imageName = req.fileName;
    } else {
      imageUrl = null;
      imageName = null;
    }

    // On ajoute la gestion de l'ID YouTube si présent

    const youtube = req.youtubeId || null;
    const sql =
      "INSERT INTO recettes (title, description, imageUrl, etapes, userId, imageName, youtube) VALUES (?, ?, ?, ?, ?, ?, ?)";
    const params = [
      title,
      description,
      imageUrl,
      etapesJson,
      userId,
      imageName,
      youtube,
    ];
    const [result] = await connexion.execute(sql, params);
    res.status(201).json({
      message: "Recette ajoutée avec succès !",
      insertId: result.insertId,
    });
  } catch (err) {
    console.error("Erreur createRecettes:", err);
    res.status(500).json({ error: "Erreur serveur lors de l'insertion." });
  }
};

exports.getRecette = async (req, res, next) => {
  try {
    const sql = "SELECT * FROM recettes WHERE id = ?";
    const [rows] = await connexion.execute(sql, [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Recette non trouvée" });
    }
    const recette = rows[0];
    recette.etapes = recette.etapes ? JSON.parse(recette.etapes) : [];
    res.status(200).json(recette);
  } catch (err) {
    console.error("Erreur getRecette:", err);
    res.status(500).json({ error: "Erreur serveur lors de la récupération." });
  }
};

exports.getRecettes = async (req, res, next) => {
  try {
    const [rows] = await connexion.query("SELECT * FROM recettes");
    const recettes = rows.map((r) => ({
      ...r,
      etapes: r.etapes ? JSON.parse(r.etapes) : [],
    }));
    res.status(200).json(recettes);
  } catch (err) {
    console.error("Erreur getRecettes:", err);
    res.status(500).json({ error: "Impossible de récupérer les recettes" });
  }
};

exports.putRecettes = async (req, res, next) => {
  try {
    const recetteObject = req.file
      ? {
          ...JSON.parse(req.body.recette),
          imageUrl: req.fileUrl,
          imageName: req.fileName,
        }
      : { ...JSON.parse(req.body.recette) };
    const [rows] = await connexion.execute(
      "SELECT userId FROM recettes WHERE id = ?",
      [req.params.id],
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Recette non trouvée" });
    }
    if (rows[0].userId != req.auth.userId) {
      return res.status(401).json({ message: "Not authorized" });
    }
    const validation = recetteSchema.safeParse(recetteObject);
    if (!validation.success) {
      const formattedErrors = {};
      validation.error.issues.forEach((issue) => {
        formattedErrors[issue.path[0]] = issue.message;
      });
      return res.status(400).json({ errors: formattedErrors });
    }
    let { title, description, imageUrl, etapes, imageName } = validation.data;

    let etapesJson = JSON.stringify(etapes) || "[]";
    const userId = rows[0].userId;

    const [oldRows] = await connexion.execute(
      "SELECT * FROM recettes WHERE id = ?",
      [req.params.id],
    );
    if (oldRows.length && oldRows[0].imageName) {
      try {
        const command = new DeleteObjectCommand({
          Bucket: "paris",
          Key: "grp5/" + oldRows[0].imageName,
        });
        await client.send(command);
      } catch (error) {
        res.status(500).json({ error: error.message });
        next(error);
      }
    }

    // suppression de la vidéo YouTube associée à l'ancienne recette si elle existe, pour éviter d'avoir des vidéos orphelines sur YouTube

    if (oldRows.length && oldRows[0].youtube) {
      try {
        await youtube.videos.delete({
          id: oldRows[0].youtube,
        });
      } catch (error) {
        console.error("Erreur suppression vidéo YouTube:", error);
        // On continue même si la suppression YouTube échoue, car ce n'est pas critique pour la mise à jour de la recette
      }
    }
    // On ajoute la gestion de l'ID YouTube si présent

    const youtubeId = req.youtubeId || null;
    const sql =
      "UPDATE recettes SET title = ?, description = ?, imageUrl = ?, etapes = ?, userId = ?, imageName = ?, youtube = ? WHERE id = ?";
    const params = [
      title,
      description,
      req.fileUrl || null,
      etapesJson,
      userId,
      req.fileName || null,
      youtubeId,
      req.params.id,
    ];
    await connexion.execute(sql, params);
    res.status(200).json({ message: "Recette mise à jour avec succès !" });
  } catch (err) {
    console.error("Erreur putRecettes:", err);
    res.status(500).json({ error: "Erreur serveur lors de la mise à jour." });
  }
};

exports.deleteRecettes = async (req, res, next) => {
  try {
    const [rows] = await connexion.execute(
      "SELECT * FROM recettes WHERE id = ?",
      [req.params.id],
    );
    if (rows.length && rows[0].imageName) {
      try {
        const command = new DeleteObjectCommand({
          Bucket: "paris",
          Key: "grp5/" + rows[0].imageName,
        });
        await client.send(command);
      } catch (error) {
        res.status(500).json({ error: error.message });
        next(error);
      }
    }
    // suppression de la vidéo YouTube associée à l'ancienne recette si elle existe, pour éviter d'avoir des vidéos orphelines sur YouTube

    if (rows.length && rows[0].youtube) {
      try {
        await youtube.videos.delete({
          id: rows[0].youtube,
        });
      } catch (error) {
        console.error("Erreur suppression vidéo YouTube:", error);
        // On continue même si la suppression YouTube échoue, car ce n'est pas critique pour la mise à jour de la recette
      }
    }
    const sql = "DELETE FROM recettes WHERE id = ?";
    const [result] = await connexion.execute(sql, [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Recette non trouvée" });
    }
    res.status(200).json({ message: "Recette supprimée avec succès !" });
  } catch (err) {
    console.error("Erreur deleteRecettes:", err);
    res.status(500).json({ error: "Erreur serveur lors de la suppression." });
  }
};
