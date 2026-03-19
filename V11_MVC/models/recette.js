const connexion = require("../utils/db");

const Recette = {
  // Trouver toutes les recettes
  findAll: async () => {
    const [rows] = await connexion.query("SELECT * FROM recettes");
    return rows;
  },

  // Trouver une recette par ID
  findById: async (id) => {
    const [rows] = await connexion.execute(
      "SELECT * FROM recettes WHERE id = ?",
      [id],
    );
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
};

module.exports = Recette;
