const User = require("../models/user");
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

exports.sign_up = async (req, res) => {
  try {
    const validation = userSchema.safeParse(req.body);
    if (!validation.success) {
      return res
        .status(400)
        .json({ errors: validation.error.flatten().fieldErrors });
    }
    const { username, password } = validation.data;
    const existingUser = await User.findByUsername(username);
    if (existingUser) {
      return res
        .status(409)
        .json({ error: "Ce nom d'utilisateur est déjà utilisé" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = await User.create(username, hashedPassword);
    res.status(201).json({
      message: "Utilisateur créé avec succès",
      userId,
    });
  } catch (err) {
    console.error("Erreur sign_up:", err);
    res.status(500).json({ error: "Erreur serveur lors de l'inscription." });
  }
};

exports.log_in = async (req, res) => {
  try {
    const validation = userSchema.safeParse(req.body);
    if (!validation.success) {
      return res
        .status(400)
        .json({ errors: validation.error.flatten().fieldErrors });
    }
    const { username, password } = validation.data;
    const user = await User.findByUsername(username);
    if (!user) {
      return res.status(401).json({ error: "Identifiants invalides" });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: "Identifiants invalides" });
    }
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || "RANDOM_TOKEN_SECRET",
      { expiresIn: "24h" },
    );
    res.status(200).json({ token });
  } catch (err) {
    console.error("Erreur log_in:", err);
    res.status(500).json({ error: "Erreur serveur lors de la connexion." });
  }
};
