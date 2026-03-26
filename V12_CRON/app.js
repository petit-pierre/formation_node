const express = require("express");
const app = express();
const recettesRoutes = require("./routes/recettes");
const usersRoutes = require("./routes/users");
const s3Routes = require("./routes/s3");
const infosRoutes = require("./routes/infos");

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization",
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS, PATCH",
  );
  next();
});

app.use(express.json());

app.use("/recettes", recettesRoutes);
app.use("/users", usersRoutes);
app.use("/s3", s3Routes);
app.use("/", infosRoutes);

module.exports = app;
