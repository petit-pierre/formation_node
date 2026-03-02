// Nous allons utiliser le module mysql2/promise pour interagir avec notre base de données MySQL.

const mysql = require('mysql2/promise');
const express = require('express');
const app = express();

// Configuration de la base de données MySQL

const connexion = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'recettes',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

app.use(express.json());
app.use(express.text());

// Route pour récupérer toutes les recettes

app.get('/recettes', async (req, res, next) => {
  try {
    // Liste toutes les recettes depuis la base
    const [rows] = await connexion.query('SELECT * FROM recettes');
    // convertir les champs JSON si nécessaire
    const recettes = rows.map(r => ({
      ...r,
      etapes: r.etapes ? JSON.parse(r.etapes) : []
    }));
    res.status(200).json(recettes);
  } catch (err) {
    console.error('Erreur GET /recettes:', err);
    res.status(500).json({ error: 'Impossible de récupérer les recettes' });
  }
});

// Route pour ajouter une nouvelle recette

app.post('/recettes', async (req, res, next) => {
  try {
    let { title, description, imageUrl, etapes, userId } = req.body || {};
    title = title || 'untitled';
    description = description || 'no description';
    let etapesJson = JSON.stringify(etapes) || '[]';
    userId = userId || '0';

    // Requête préparée pour insérer la recette
    const sql = 'INSERT INTO recettes (title, description, imageUrl, etapes, userId) VALUES (?, ?, ?, ?, ?)';
    let params = [title, description, imageUrl || null, etapesJson, userId];
    const [result] = await connexion.execute(sql, params);
    res.status(201).json({ message: 'Recette ajoutée avec succès !', insertId: result.insertId });
  } catch (err) {
    console.error('Erreur POST /recettes:', err);
    res.status(500).json({ error: 'Erreur serveur lors de l\'insertion.' });
  }
});

// Route pour mettre à jour une recette par ID

app.put('/recettes/:id', async (req, res, next) => {
  try {
    let { title, description, imageUrl, etapes, userId } = req.body || {};
    title = title || 'untitled';
    description = description || 'no description';
    let etapesJson = JSON.stringify(etapes) || '[]';
    userId = userId || '0';

    // Requête préparée pour insérer la recette
    const sql = 'UPDATE recettes SET title = ?, description = ?, imageUrl = ?, etapes = ?, userId = ? WHERE id = ?';
    let params = [title, description, imageUrl || null, etapesJson, userId, req.params.id];
    const [result] = await connexion.execute(sql, params);
    res.status(201).json({ message: 'Recette mise à jour avec succès !', insertId: result.insertId });
  } catch (err) {
    console.error('Erreur POST /recettes:', err);
    res.status(500).json({ error: 'Erreur serveur lors de la mise à jour.' });
  }
});

// Route pour supprimer une recette par ID

app.delete('/recettes/:id', async (req, res, next) => {
  try {
    const sql = 'DELETE FROM recettes WHERE id = ?';
    const [result] = await connexion.execute(sql, [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Recette non trouvée' });
    }
    res.status(200).json({ message: 'Recette supprimée avec succès !' });
  } catch (err) {
    console.error('Erreur DELETE /recettes/:id:', err);
    res.status(500).json({ error: 'Erreur serveur lors de la suppression.' });
  }
});


module.exports = app;
