const Recette = require("../models/recette");
const { videoQueue } = require("../utils/videoQueue");
const { recetteSchema } = require("../validator/recette");

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

    // Traitement des données pour le front
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
    // 1. On récupère l'existant via le Modèle
    const ancienneRecette = await Recette.findById(req.params.id);

    if (!ancienneRecette) {
      return res.status(404).json({ error: "Recette non trouvée" });
    }

    // 2. Vérification de l'auteur
    if (ancienneRecette.userId != req.auth.userId) {
      return res
        .status(403)
        .json({ message: "Non autorisé : vous n'êtes pas l'auteur." });
    }

    // 3. Validation Zod du texte
    const recetteObject = JSON.parse(req.body.recette);
    const validation = recetteSchema.safeParse(recetteObject);

    if (!validation.success) {
      return res
        .status(400)
        .json({ errors: validation.error.flatten().fieldErrors });
    }

    const { title, description, etapes } = validation.data;
    const etapesJson = JSON.stringify(etapes) || "[]";

    // 4. Déterminer le statut (si nouveau fichier, on repasse en pending)
    const nouveauStatut = req.file ? "pending" : ancienneRecette.status;

    // 5. Mise à jour via le Modèle (Reset des URLs si nouveau fichier)
    await Recette.update(req.params.id, {
      title,
      description,
      etapes: etapesJson,
      status: nouveauStatut,
    });

    // 6. Gestion du média si un fichier est présent
    if (req.file) {
      await videoQueue.add("process-media", {
        action: "UPDATE",
        recetteId: req.params.id,
        filePath: req.file.path,
        fileName: req.file.filename,
        mimetype: req.file.mimetype,
        title: title,
        // On passe les anciens IDs pour que le worker nettoie S3/YouTube
        oldS3Name: ancienneRecette.imageName,
        oldYoutubeId: ancienneRecette.youtube,
      });

      return res.status(202).json({
        message: "Texte mis à jour, traitement du nouveau média en cours...",
      });
    }

    res.status(200).json({ message: "Recette mise à jour avec succès !" });
  } catch (err) {
    console.error("Erreur putRecettes:", err);
    res.status(500).json({ error: "Erreur serveur lors de la mise à jour." });
  }
};
