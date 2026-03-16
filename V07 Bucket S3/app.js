const express = require('express');
const app = express();
const path = require("path");
const recettesRoutes = require("./routes/recettes");
const usersRoutes = require("./routes/users");

// Ajoutons deux nouvelles routes pour les infos et le s3
const s3Routes = require("./routes/s3");
const infosRoutes = require("./routes/infos");

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

app.use(express.json());
app.use(express.text());

app.use("/recettes", recettesRoutes);
app.use("/users", usersRoutes);

// Utilisation des nouvelles routes

app.use("/s3", s3Routes);
app.use("/", infosRoutes);

module.exports = app;
