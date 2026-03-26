require("dotenv").config({ path: "./.env" });
const connexion = require("../utils/db");
const client = require("../utils/s3Config");
const { GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const Recette = {
  // Trouver toutes les recettes
  findAll: async () => {
    const [rows] = await connexion.query("SELECT * FROM recettes");
    await Promise.all(
      rows.map(async (row) => {
        if (row.imageName) {
          const getCommand = new GetObjectCommand({
            Bucket: "paris",
            Key: `grp5/${row.imageName}`,
          });
          // On met à jour directement la propriété imageUrl de l'objet row
          // On peut spécifier la durée (ex: 3600 secondes pour 1h)
          row.imageUrl = await getSignedUrl(client, getCommand, {
            expiresIn: 3600,
          });
        }
      }),
    );
    return rows;
  },

  // Trouver toutes les recettes validés
  findAllValide: async () => {
    const [rows] = await connexion.query(
      "SELECT * FROM recettes WHERE status = 'visible'",
    );
    await Promise.all(
      rows.map(async (row) => {
        if (row.imageName) {
          const getCommand = new GetObjectCommand({
            Bucket: "paris",
            Key: `grp5/${row.imageName}`,
          });
          // On met à jour directement la propriété imageUrl de l'objet row
          // On peut spécifier la durée (ex: 3600 secondes pour 1h)
          row.imageUrl = await getSignedUrl(client, getCommand, {
            expiresIn: 3600,
          });
        }
      }),
    );
    return rows;
  },

  // Trouver une recette par ID
  findById: async (id) => {
    const [rows] = await connexion.execute(
      "SELECT * FROM recettes WHERE id = ?",
      [id],
    );
    // 1. VERIFICATION CRITIQUE : Si rows[0] n'existe pas, on sort direct
    if (!rows[0]) {
      return null;
    }
    if (rows[0].imageName) {
      const getCommand = new GetObjectCommand({
        Bucket: "paris",
        Key: `grp5/${rows[0].imageName}`,
      });
      // On met à jour directement la propriété imageUrl de l'objet row
      // On peut spécifier la durée (ex: 3600 secondes pour 1h)
      rows[0].imageUrl = await getSignedUrl(client, getCommand, {
        expiresIn: 3600,
      });
    }
    return rows[0];
  },

  // Créer une recette
  create: async (data) => {
    const { title, description, etapes, userId, imageName, youtube, status } =
      data;
    const sql = `INSERT INTO recettes 
      (title, description, etapes, userId, imageName, youtube, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const [result] = await connexion.execute(sql, [
      title,
      description,
      etapes,
      userId,
      imageName,
      youtube,
      status,
    ]);
    return result.insertId;
  },

  // Mettre à jour (version texte + reset média)
  update: async (id, data) => {
    const { title, description, etapes, status } = data;
    const sql = `UPDATE recettes 
      SET title = ?, description = ?, etapes = ?, imageName = NULL, youtube = NULL, status = ? 
      WHERE id = ?`;
    return await connexion.execute(sql, [
      title,
      description,
      etapes,
      status,
      id,
    ]);
  },

  // Supprimer
  delete: async (id) => {
    return await connexion.execute("DELETE FROM recettes WHERE id = ?", [id]);
  },

  // FINALISATION : Mise à jour après succès du traitement media
  updateMediaSuccess: async (id, data) => {
    const { imageName, youtubeId } = data;
    const sql = `
      UPDATE recettes 
      SET imageName = ?, youtube = ?, status = 'published' 
      WHERE id = ?`;
    return await connexion.execute(sql, [imageName, youtubeId, id]);
  },

  // ERREUR : Marquer la recette en erreur
  updateStatusError: async (id) => {
    const sql = "UPDATE recettes SET status = 'error' WHERE id = ?";
    return await connexion.execute(sql, [id]);
  },

  // Validate : Marquer la recette en validé
  updateStatusValidate: async (id) => {
    const sql = "UPDATE recettes SET status = 'validate' WHERE id = ?";
    return await connexion.execute(sql, [id]);
  },

  // Recupere les recette avec le status published
  findPublished: async () => {
    try {
      const [rows] = await connexion.execute(
        "SELECT * FROM recettes WHERE status = ?",
        ["published"],
      );
      return rows;
    } catch (err) {
      console.error(
        "Erreur lors de la récupération des recettes publiées:",
        err,
      );
      throw err;
    }
  },

  // Modifier le status manuelement
  patch: async (id, status) => {
    try {
      const [rows] = await connexion.execute(
        "UPDATE recettes SET status = ? WHERE id = ?",
        [status, id],
      );
      return rows;
    } catch (err) {
      console.error("Erreur lors de la modification du status", err);
      throw err;
    }
  },
};

module.exports = Recette;
