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

// exports.putRecettes = async (req, res, next) => {
//   try {
//     const recetteObject = req.file
//       ? {
//           ...JSON.parse(req.body.recette),
//           imageUrl: req.fileUrl,
//           imageName: req.fileName,
//         }
//       : { ...JSON.parse(req.body.recette) };
//     const [rows] = await connexion.execute(
//       "SELECT userId FROM recettes WHERE id = ?",
//       [req.params.id],
//     );
//     if (rows.length === 0) {
//       return res.status(404).json({ error: "Recette non trouvée" });
//     }
//     if (rows[0].userId != req.auth.userId) {
//       return res.status(401).json({ message: "Not authorized" });
//     }
//     const validation = recetteSchema.safeParse(recetteObject);
//     if (!validation.success) {
//       const formattedErrors = {};
//       validation.error.issues.forEach((issue) => {
//         formattedErrors[issue.path[0]] = issue.message;
//       });
//       return res.status(400).json({ errors: formattedErrors });
//     }
//     let { title, description, imageUrl, etapes, imageName } = validation.data;

//     let etapesJson = JSON.stringify(etapes) || "[]";
//     const userId = rows[0].userId;

//     const [oldRows] = await connexion.execute(
//       "SELECT * FROM recettes WHERE id = ?",
//       [req.params.id],
//     );
//     if (oldRows.length && oldRows[0].imageName) {
//       try {
//         const command = new DeleteObjectCommand({
//           Bucket: "paris",
//           Key: "grp5/" + oldRows[0].imageName,
//         });
//         await client.send(command);
//       } catch (error) {
//         res.status(500).json({ error: error.message });
//         next(error);
//       }
//     }

//     // suppression de la vidéo YouTube associée à l'ancienne recette si elle existe, pour éviter d'avoir des vidéos orphelines sur YouTube

//     if (oldRows.length && oldRows[0].youtube) {
//       try {
//         await youtube.videos.delete({
//           id: oldRows[0].youtube,
//         });
//       } catch (error) {
//         console.error("Erreur suppression vidéo YouTube:", error);
//         // On continue même si la suppression YouTube échoue, car ce n'est pas critique pour la mise à jour de la recette
//       }
//     }
//     // On ajoute la gestion de l'ID YouTube si présent

//     const youtubeId = req.youtubeId || null;
//     const sql =
//       "UPDATE recettes SET title = ?, description = ?, imageUrl = ?, etapes = ?, userId = ?, imageName = ?, youtube = ? WHERE id = ?";
//     const params = [
//       title,
//       description,
//       req.fileUrl || null,
//       etapesJson,
//       userId,
//       req.fileName || null,
//       youtubeId,
//       req.params.id,
//     ];
//     await connexion.execute(sql, params);
//     res.status(200).json({ message: "Recette mise à jour avec succès !" });
//   } catch (err) {
//     console.error("Erreur putRecettes:", err);
//     res.status(500).json({ error: "Erreur serveur lors de la mise à jour." });
//   }
// };

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

    // 2. On supprime la ligne en BDD immédiatement
    const [result] = await connexion.execute(
      "DELETE FROM recettes WHERE id = ?",
      [req.params.id],
    );

    // 3. On délègue le nettoyage au Worker
    // On envoie les infos même si elles sont null, le worker gérera les "if"
    await videoQueue.add("cleanup-media", {
      action: "DELETE",
      recetteId: req.params.id,
      oldS3Name: imageName, // Correspond au nom attendu dans ton Worker
      oldYoutubeId: youtubeId, // Correspond au nom attendu dans ton Worker
    });

    res.status(200).json({
      message:
        "Recette supprimée de la base. Nettoyage des médias en arrière-plan.",
    });
  } catch (err) {
    console.error("Erreur deleteRecettes:", err);
    res.status(500).json({ error: "Erreur serveur lors de la suppression." });
  }
};
