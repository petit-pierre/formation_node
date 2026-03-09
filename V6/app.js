const mysql = require('mysql2/promise');
const express = require('express');
const app = express();
const path = require("path");
const recettesRoutes = require("./routes/recettes");
const usersRoutes = require("./routes/users");

require('dotenv').config();

const connexion = require('./db');

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

app.use(express.json());
app.use(express.text());

// Servir les images statiques depuis le dossier "images"

app.use('/images', express.static(path.join(__dirname, 'images')));

app.use("/recettes", recettesRoutes);
app.use("/users", usersRoutes);

module.exports = app;
