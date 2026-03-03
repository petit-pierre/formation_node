const mysql = require('mysql2/promise');
const express = require('express');
const app = express();

// On importe path pour gérer les chemins de fichiers

const path = require("path");

// Faisons un peu de ménage et organisons notre code en plusieurs fichiers :

const recettesRoutes = require("./routes/recettes");
const usersRoutes = require("./routes/users");

// charger les variables d'environnement depuis .env
require('dotenv').config();

// pool de connexions centralisé
const connexion = require('./db');

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

app.use(express.json());
app.use(express.text());

app.use('/images', express.static(path.join(__dirname, 'images')));

// Routes pour les recettes

app.use("/recettes", recettesRoutes);

// Routes pour les utilisateurs (authentification, etc.)


app.use("/users", usersRoutes);

module.exports = app;
