const connexion = require('../db');
require('dotenv').config({ path: '../.env' });
const { S3Client,DeleteObjectCommand } = require("@aws-sdk/client-s3");

const client = new S3Client({
    region: process.env.SCALEWAY_REGION,
    endpoint: process.env.SCALEWAY_ENDPOINT,
    credentials: {
        accessKeyId: process.env.SCALEWAY_ACCESS_KEY,
        secretAccessKey: process.env.SCALEWAY_SECRET_KEY,
    },
});

exports.optionsRecettes = (req, res) => {
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.status(200).json({ "post /": "poster une recette, cette route est sécurisée par authentification" ,"get /:id": "récupérer une recette par son id", "get /": "récupérer toutes les recettes", "put /:id": "mettre à jour une recette par son id, cette route est sécurisée par authentification", "delete /:id": "supprimer une recette par son id, cette route est sécurisée par authentification" });
}

// Nous modifions cette fonction pour gerer le s3
// Grace aux modifications dans le middleware multer, nous avons maintenant accès à req.fileUrl et req.fileName qui contiennent respectivement l'URL de l'image stockée sur S3 et le nom du fichier. Nous allons utiliser ces informations pour stocker l'URL dans la base de données et pour supprimer l'image de S3 lors de la mise à jour ou de la suppression d'une recette.

exports.createRecettes = async (req, res, next) => {
  try {
    const recetteObject = JSON.parse(req.body.recette);
    let { title, description, etapes } = recetteObject || {};
    title = title || 'untitled';
    description = description || 'no description';
    let etapesJson = JSON.stringify(etapes) || '[]';
    const userId = req.auth.userId;
    let imageUrl = null;
    let imageName = null;
    if (req.file) {
      imageUrl = req.fileUrl;
      imageName = req.fileName;
    }
    const sql = 'INSERT INTO recettes (title, description, imageUrl, etapes, userId, imageName) VALUES (?, ?, ?, ?, ?, ?)';
    const params = [title, description, imageUrl, etapesJson, userId, imageName];
    const [result] = await connexion.execute(sql, params);
    res.status(201).json({ message: 'Recette ajoutée avec succès !', insertId: result.insertId });
  } catch (err) {
    console.error('Erreur createRecettes:', err);
    res.status(500).json({ error: 'Erreur serveur lors de l\'insertion.' });
  }
};

// Ici, rien ne change.

exports.getRecette = async (req, res, next) => {
  try {
    const sql = 'SELECT * FROM recettes WHERE id = ?';
    const [rows] = await connexion.execute(sql, [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Recette non trouvée' });
    }
    const recette = rows[0];
    recette.etapes = recette.etapes ? JSON.parse(recette.etapes) : [];
    res.status(200).json(recette);
  } catch (err) {
    console.error('Erreur getRecette:', err);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération.' });
  }
};

exports.getRecettes = async (req, res, next) => {
  try {
    const [rows] = await connexion.query('SELECT * FROM recettes');
    const recettes = rows.map((r) => ({
      ...r,
      etapes: r.etapes ? JSON.parse(r.etapes) : []
    }));
    res.status(200).json(recettes);
  } catch (err) {
    console.error('Erreur getRecettes:', err);
    res.status(500).json({ error: 'Impossible de récupérer les recettes' });
  }
};

// La fonction putRecettes est modifiée pour gérer la mise à jour de l'image sur S3. Si une nouvelle image est fournie, nous vérifions d'abord si une ancienne image existe et la supprimons de S3 avant de mettre à jour la recette avec la nouvelle URL et le nouveau nom de fichier.

exports.putRecettes = async (req, res, next) => {
  try {
    const recetteObject = req.file
      ? { ...JSON.parse(req.body.recette), imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}` }
      : { ...req.body };
    const [rows] = await connexion.execute('SELECT userId FROM recettes WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Recette non trouvée' });
    }
    if (rows[0].userId != req.auth.userId) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    let { title, description, imageUrl, etapes } = recetteObject;
    title = title || 'untitled';
    description = description || 'no description';
    let etapesJson = JSON.stringify(etapes) || '[]';
    const userId = rows[0].userId;
    if (req.file) {
      const [oldRows] = await connexion.execute('SELECT imageName FROM recettes WHERE id = ?', [req.params.id]);
      if (oldRows.length && oldRows[0].imageName) {
        try {
                const command = new DeleteObjectCommand({
                    Bucket: "paris",
                    Key: "grp5/"+oldRows[0].imageName, // Clé du fichier à supprimer (ex: "grp5/fichier.jpg")
                });
                await client.send(command);
            } catch (error) {
                res.status(500).json({ error: error.message });
                next(error);
            }
      }
    }
    const sql = 'UPDATE recettes SET title = ?, description = ?, imageUrl = ?, etapes = ?, userId = ?, imageName = ? WHERE id = ?';
    const params = [title, description, req.fileUrl || null, etapesJson, userId, req.fileName || null, req.params.id];
    await connexion.execute(sql, params);
    res.status(200).json({ message: 'Recette mise à jour avec succès !' });
  } catch (err) {
    console.error('Erreur putRecettes:', err);
    res.status(500).json({ error: 'Erreur serveur lors de la mise à jour.' });
  }
};

// La fonction deleteRecettes est modifiée pour supprimer l'image associée à la recette de S3 avant de supprimer la recette de la base de données. Nous récupérons d'abord le nom du fichier de l'image à partir de la base de données, puis nous utilisons ce nom pour supprimer le fichier de S3.

exports.deleteRecettes = async (req, res, next) => {
  try {
    const [rows] = await connexion.execute('SELECT imageName FROM recettes WHERE id = ?', [req.params.id]);
    if (rows.length && rows[0].imageName) {
      try {
                const command = new DeleteObjectCommand({
                    Bucket: "paris",
                    Key: "grp5/"+rows[0].imageName, // Clé du fichier à supprimer (ex: "grp5/fichier.jpg")
                });
                await client.send(command);
            } catch (error) {
                res.status(500).json({ error: error.message });
                next(error);
            }
    }
    const sql = 'DELETE FROM recettes WHERE id = ?';
    const [result] = await connexion.execute(sql, [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Recette non trouvée' });
    }
    res.status(200).json({ message: 'Recette supprimée avec succès !' });
  } catch (err) {
    console.error('Erreur deleteRecettes:', err);
    res.status(500).json({ error: 'Erreur serveur lors de la suppression.' });
  }
};