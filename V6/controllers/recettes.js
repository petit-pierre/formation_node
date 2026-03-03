const connexion = require('../db');
const fs = require('fs');

// On renseigne sur les méthodes autorisées pour la route /recettes

exports.optionsRecettes = (req, res) => {
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.status(200).json({ "post /": "poster une recette, cette route est sécurisée par authentification" ,"get /:id": "récupérer une recette par son id", "get /": "récupérer toutes les recettes", "put /:id": "mettre à jour une recette par son id, cette route est sécurisée par authentification", "delete /:id": "supprimer une recette par son id, cette route est sécurisée par authentification" });
}

// Création d'une nouvelle recette
exports.createRecettes = async (req, res, next) => {
  try {
    // Parser les données JSON depuis req.body.recette
    const recetteObject = JSON.parse(req.body.recette);
    
    let { title, description, etapes } = recetteObject || {};
    title = title || 'untitled';
    description = description || 'no description';
    let etapesJson = JSON.stringify(etapes) || '[]';
    
    // Récupérer l'userId depuis l'authentification
    const userId = req.auth.userId;
    
    // Construire l'URL de l'image si un fichier a été uploadé
    let imageUrl = null;
    if (req.file) {
      imageUrl = `${req.protocol}://${req.get('host')}/images/${req.file.filename}`;
    }

    const sql = 'INSERT INTO recettes (title, description, imageUrl, etapes, userId) VALUES (?, ?, ?, ?, ?)';
    const params = [title, description, imageUrl, etapesJson, userId];
    const [result] = await connexion.execute(sql, params);
    res.status(201).json({ message: 'Recette ajoutée avec succès !', insertId: result.insertId });
  } catch (err) {
    console.error('Erreur createRecettes:', err);
    res.status(500).json({ error: 'Erreur serveur lors de l\'insertion.' });
  }
};

// Retourne une recette par identifiant
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

// Retourne toutes les recettes
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

// Mise à jour d'une recette existante
exports.putRecettes = async (req, res, next) => {
  try {
    // déterminer l'objet envoyé
    const recetteObject = req.file
      ? { ...JSON.parse(req.body.recette), imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}` }
      : { ...req.body };

    // récupérer la recette existante pour vérifier l'appartenance
    const [rows] = await connexion.execute('SELECT userId FROM recettes WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Recette non trouvée' });
    }
    if (rows[0].userId != req.auth.userId) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // préparer les champs mis à jour
    let { title, description, imageUrl, etapes } = recetteObject;
    title = title || 'untitled';
    description = description || 'no description';
    let etapesJson = JSON.stringify(etapes) || '[]';
    const userId = rows[0].userId; // on conserve l'utilisateur original

    // if a new image is provided and there was a previous one, delete the old file
    if (req.file) {
      // retrieve old image URL to remove file
      const [oldRows] = await connexion.execute('SELECT imageUrl FROM recettes WHERE id = ?', [req.params.id]);
      if (oldRows.length && oldRows[0].imageUrl) {
        const filename = oldRows[0].imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, (err) => {
          if (err) console.warn('Erreur suppression image ancienne:', err);
        });
      }
    }

    const sql = 'UPDATE recettes SET title = ?, description = ?, imageUrl = ?, etapes = ?, userId = ? WHERE id = ?';
    const params = [title, description, imageUrl || null, etapesJson, userId, req.params.id];
    await connexion.execute(sql, params);
    res.status(200).json({ message: 'Recette mise à jour avec succès !' });
  } catch (err) {
    console.error('Erreur putRecettes:', err);
    res.status(500).json({ error: 'Erreur serveur lors de la mise à jour.' });
  }
};

// Suppression d'une recette
exports.deleteRecettes = async (req, res, next) => {
  try {
    // delete image file if exists
    const [rows] = await connexion.execute('SELECT imageUrl FROM recettes WHERE id = ?', [req.params.id]);
    if (rows.length && rows[0].imageUrl) {
      const filename = rows[0].imageUrl.split('/images/')[1];
      fs.unlink(`images/${filename}`, (err) => {
        if (err) console.warn('Erreur suppression image lors de delete:', err);
      });
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