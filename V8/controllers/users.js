const connexion = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { userSchema } = require("../validator/user");

exports.optionsUsers = (req, res) => {
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.status(200).json({
    "post /sign_up": "créer un utilisateur",
    "post /log_in": "se connecter",
  });
};

exports.sign_up = async (req, res, next) => {
  const validation = userSchema.safeParse(req.body);
  if (!validation.success) {
    const formattedErrors = {};
    validation.error.issues.forEach((issue) => {
      formattedErrors[issue.path[0]] = issue.message;
    });

    return res.status(400).json({ errors: formattedErrors });
  }
  const { username, password } = validation.data;
  const [existing] = await connexion.execute(
    "SELECT id FROM users WHERE username = ?",
    [username],
  );
  if (existing.length > 0) {
    return res
      .status(409)
      .json({ error: "Ce nom d'utilisateur est déjà utilisé" });
  }
  const sql = "INSERT INTO users (username, password) VALUES (?, ?)";
  const hashedPassword = await bcrypt.hash(password, 10);
  const params = [username, hashedPassword];
  const [result] = await connexion.execute(sql, params);
  res
    .status(201)
    .json({ message: "Utilisateur créé avec succès", userId: result.insertId });
};

exports.log_in = async (req, res, next) => {
  try {
    const validation = userSchema.safeParse(req.body);
    if (!validation.success) {
      const formattedErrors = {};
      validation.error.issues.forEach((issue) => {
        formattedErrors[issue.path[0]] = issue.message;
      });

      return res.status(400).json({ errors: formattedErrors });
    }
    const { username, password } = validation.data;
    const [rows] = await connexion.execute(
      "SELECT id, password FROM users WHERE username = ?",
      [username],
    );
    if (rows.length === 0) {
      return res.status(401).json({ error: "Identifiants invalides" });
    }
    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: "Identifiants invalides" });
    }
    res.status(200).json({
      token: jwt.sign({ userId: user.id }, "RANDOM_TOKEN_SECRET", {
        expiresIn: "24h",
      }),
    });
  } catch (err) {
    console.error("Erreur log_in:", err);
    res.status(500).json({ error: "Erreur du serveur lors de la connexion." });
  }
};
