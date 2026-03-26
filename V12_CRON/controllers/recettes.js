const Recette = require("../models/recette");
const { videoQueue } = require("../utils/videoQueue");
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

// GET ALL
exports.getRecettes = async (req, res) => {
  try {
    const rows = await Recette.findAll();
    const recettes = rows.map((r) => ({
      ...r,
      etapes: r.etapes ? JSON.parse(r.etapes) : [],
    }));
    res.status(200).json(recettes);
  } catch (err) {
    res.status(500).json({ error: "Impossible de récupérer les recettes" });
  }
};

// GET ALL VALIDATE
exports.getValideRecettes = async (req, res) => {
  try {
    const rows = await Recette.findAllValide();
    const recettes = rows.map((r) => ({
      ...r,
      etapes: r.etapes ? JSON.parse(r.etapes) : [],
    }));
    res.status(200).json(recettes);
  } catch (err) {
    res.status(500).json({ error: "Impossible de récupérer les recettes" });
  }
};

// CREATE
exports.createRecettes = async (req, res) => {
  try {
    const recetteObject = JSON.parse(req.body.recette);
    const validation = recetteSchema.safeParse(recetteObject);

    if (!validation.success) {
      return res
        .status(400)
        .json({ errors: validation.error.flatten().fieldErrors });
    }

    validation.data.imageName = null;
    validation.data.youtube = null;

    const newId = await Recette.create({
      ...validation.data,
      userId: req.auth.userId,
      etapes: JSON.stringify(validation.data.etapes) || "[]",
      status: "pending",
    });

    await videoQueue.add("process-media", {
      action: "CREATE",
      recetteId: newId,
      filePath: req.file.path,
      fileName: req.fileName,
      mimetype: req.file.mimetype,
      title: validation.data.title,
    });
    res.status(202).json({ message: "Traitement en cours...", id: newId });
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de l'insertion." });
  }
};

// DELETE
exports.deleteRecettes = async (req, res) => {
  try {
    const recette = await Recette.findById(req.params.id);
    if (!recette) return res.status(404).json({ error: "Non trouvée" });

    await videoQueue.add("cleanup-media", {
      action: "DELETE",
      recetteId: req.params.id,
      oldS3Name: recette.imageName,
      oldYoutubeId: recette.youtube,
    });
    await Recette.delete(req.params.id);
    res.status(200).json({ message: "Supprimée, nettoyage Cloud lancé." });
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la suppression." });
  }
};

// GET ONE BY ID
exports.getRecette = async (req, res) => {
  try {
    const recette = await Recette.findById(req.params.id);
    if (!recette) {
      return res.status(404).json({ error: "Recette non trouvée" });
    }
    recette.etapes = recette.etapes ? JSON.parse(recette.etapes) : [];
    res.status(200).json(recette);
  } catch (err) {
    console.error("Erreur getRecette:", err);
    res.status(500).json({ error: "Erreur serveur lors de la récupération." });
  }
};

// PUT (UPDATE)
exports.putRecettes = async (req, res) => {
  try {
    const ancienneRecette = await Recette.findById(req.params.id);
    if (!ancienneRecette) {
      return res.status(404).json({ error: "Recette non trouvée" });
    }
    if (ancienneRecette.userId != req.auth.userId) {
      return res
        .status(403)
        .json({ message: "Non autorisé : vous n'êtes pas l'auteur." });
    }
    const recetteObject = JSON.parse(req.body.recette);
    const validation = recetteSchema.safeParse(recetteObject);
    if (!validation.success) {
      return res
        .status(400)
        .json({ errors: validation.error.flatten().fieldErrors });
    }
    const { title, description, etapes } = validation.data;
    const etapesJson = JSON.stringify(etapes) || "[]";
    const nouveauStatut = req.file ? "pending" : ancienneRecette.status;
    await Recette.update(req.params.id, {
      title,
      description,
      etapes: etapesJson,
      status: nouveauStatut,
    });
    if (req.file) {
      await videoQueue.add("process-media", {
        action: "UPDATE",
        recetteId: req.params.id,
        filePath: req.file.path,
        fileName: req.filename,
        mimetype: req.file.mimetype,
        title: title,
        // On passe les anciens IDs pour que le worker nettoie S3/YouTube
        oldS3Name: ancienneRecette.imageName,
        oldYoutubeId: ancienneRecette.youtube,
      });
      return res.status(202).json({
        message: "Texte mis à jour, traitement du nouveau média en cours...",
      });
    } else {
      await videoQueue.add("cleanup-media", {
        action: "DELETE",
        recetteId: req.params.id,
        oldS3Name: ancienneRecette.imageName,
        oldYoutubeId: ancienneRecette.youtube,
      });
    }
    res.status(200).json({ message: "Recette mise à jour avec succès !" });
  } catch (err) {
    console.error("Erreur putRecettes:", err);
    res.status(500).json({ error: "Erreur serveur lors de la mise à jour." });
  }
};

// Change visibility
exports.changeVisibility = async (req, res) => {
  try {
    const recette = await Recette.findById(req.params.id);
    if (!recette) {
      return res.status(404).json({ error: "Recette non trouvée" });
    }
    req.body.visible && (await Recette.patch(req.params.id, req.body.visible));
    res.status(200).json(recette);
  } catch (err) {
    console.error("Erreur getRecette:", err);
    res.status(500).json({ error: "Erreur serveur lors de la récupération." });
  }
};
