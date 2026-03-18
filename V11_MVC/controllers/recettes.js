const { videoQueue } = require("../utils/videoQueue");

const connexion = require("../utils/db");
const { recetteSchema } = require("../validator/recette");

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
    let {
      title,
      description,
      imageUrl = null,
      etapes,
      imageName = null,
      youtube = null,
      status = "pending",
    } = validation.data;

    let etapesJson = JSON.stringify(etapes) || "[]";

    const sql =
      "INSERT INTO recettes (title, description, imageUrl, etapes, userId, imageName, youtube, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    const [result] = await connexion.execute(sql, [
      title,
      description,
      imageUrl,
      etapesJson,
      userId,
      imageName,
      youtube,
      status,
    ]);

    const newRecetteId = result.insertId;
    await videoQueue.add("process-media", {
      action: "CREATE",
      recetteId: newRecetteId,
      filePath: req.file.path, // Chemin vers le dossier temp/
      fileName: req.fileName,
      mimetype: req.file.mimetype,
      title: validation.data.title, // On peut aussi passer le titre pour l'upload YouTube
    });
    res.status(202).json({ message: "Fichier reçu, traitement en cours..." });
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
    // 1. On récupère d'abord l'état actuel de la recette pour vérifier l'auteur et les anciens médias
    const [rows] = await connexion.execute(
      "SELECT * FROM recettes WHERE id = ?",
      [req.params.id],
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Recette non trouvée" });
    }

    if (rows[0].userId != req.auth.userId) {
      return res.status(401).json({ message: "Non autorisé" });
    }

    // 2. Validation des données texte (Zod)
    const recetteObject = JSON.parse(req.body.recette);
    const validation = recetteSchema.safeParse(recetteObject);

    if (!validation.success) {
      const formattedErrors = {};
      validation.error.issues.forEach((issue) => {
        formattedErrors[issue.path[0]] = issue.message;
      });
      return res.status(400).json({ errors: formattedErrors });
    }

    const { title, description, etapes } = validation.data;
    const etapesJson = JSON.stringify(etapes) || "[]";

    // 3. Mise à jour immédiate des textes en BDD
    // Si un nouveau fichier arrive, on passe le statut en 'pending'
    const status = req.file ? "pending" : rows[0].status;

    const sql = `
      UPDATE recettes 
      SET title = ?, description = ?,imageURL = NULL, etapes = ?,imageName = NULL,youtube = NULL, status = ? 
      WHERE id = ?`;

    await connexion.execute(sql, [
      title,
      description,
      etapesJson,
      status,
      req.params.id,
    ]);

    // 4. Gestion du média via le Worker
    // On n'appelle le worker que si on a un nouveau fichier OU si on veut forcer un nettoyage
    if (req.file) {
      await videoQueue.add("process-media", {
        action: "UPDATE",
        recetteId: req.params.id,
        filePath: req.file.path,
        fileName: req.file.filename,
        mimetype: req.file.mimetype,
        title: title,
        // On passe les anciens noms pour que le worker les supprime du Cloud
        oldS3Name: rows[0].imageName,
        oldYoutubeId: rows[0].youtube,
      });

      return res.status(202).json({
        message: "Texte mis à jour, traitement du nouveau média en cours...",
      });
    }

    // Si pas de fichier, on répond simplement OK
    res.status(200).json({ message: "Recette mise à jour avec succès !" });
  } catch (err) {
    console.error("Erreur putRecettes:", err);
    res.status(500).json({ error: "Erreur serveur lors de la mise à jour." });
  }
};

exports.deleteRecettes = async (req, res, next) => {
  try {
    // 1. On récupère les infos du média AVANT de supprimer la ligne
    const [rows] = await connexion.execute(
      "SELECT imageName, youtube FROM recettes WHERE id = ?",
      [req.params.id],
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Recette non trouvée" });
    }

    const { imageName, youtube: youtubeId } = rows[0];

    // 2. On délègue le nettoyage au Worker
    // On envoie les infos même si elles sont null, le worker gérera les "if"
    await videoQueue.add("cleanup-media", {
      action: "DELETE",
      recetteId: req.params.id,
      oldS3Name: imageName, // Correspond au nom attendu dans ton Worker
      oldYoutubeId: youtubeId, // Correspond au nom attendu dans ton Worker
    });

    // 3. On supprime ensuite la ligne en BDD

    const [result] = await connexion.execute(
      "DELETE FROM recettes WHERE id = ?",
      [req.params.id],
    );

    res.status(200).json({
      message:
        "Recette supprimée de la base. Nettoyage des médias en arrière-plan.",
    });
  } catch (err) {
    console.error("Erreur deleteRecettes:", err);
    res.status(500).json({ error: "Erreur serveur lors de la suppression." });
  }
};
