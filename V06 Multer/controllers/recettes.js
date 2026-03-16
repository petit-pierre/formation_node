const connexion = require('../db');

// ajout d'un nouveau node module pour pouvoir supprimer les fichiers images associés aux recettes lorsqu'on les modifie ou les supprime

const fs = require('fs');

exports.optionsRecettes = (req, res) => {
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.status(200).json({ "post /": "poster une recette, cette route est sécurisée par authentification" ,"get /:id": "récupérer une recette par son id", "get /": "récupérer toutes les recettes", "put /:id": "mettre à jour une recette par son id, cette route est sécurisée par authentification", "delete /:id": "supprimer une recette par son id, cette route est sécurisée par authentification" });
}

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

    // si une nouvelle image est uploadée, supprimer l'ancienne
    if (req.file) {
      // récupérer l'URL de l'ancienne image pour la supprimer du serveur
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
    // suppression de l'image associée à la recette si elle existe
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