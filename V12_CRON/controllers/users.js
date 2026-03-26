const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { userSchema } = require("../validator/user");
const { response } = require("express");

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
    res.status(200).json({ token, user: user.role });
  } catch (err) {
    console.error("Erreur log_in:", err);
    res.status(500).json({ error: "Erreur serveur lors de la connexion." });
  }
};

exports.changeRole = async (req, res) => {
  try {
    // 1. On récupère l'utilisateur (c'est déjà un objet JS)
    const user = await User.findById(req.auth.userId);

    // 2. On vérifie si l'utilisateur existe bien en base
    if (!user) {
      return res.status(404).json({ error: "Vous n'etes pas authentifié" });
    }

    // 3. On vérifie le rôle directement
    const newAdmin = await User.findById(req.params.id);
    if (String(req.auth.userId) === String(req.params.id)) {
      return res
        .status(400)
        .json({ message: "Interdit de se modifier soi-même" });
    }
    if (user.role === "admin") {
      if (newAdmin.role === "admin") {
        const role = await User.changeRole(null, req.params.id);
        return res.status(200).json({
          response: "l utilisateur a perdu ses droits",
        });
      } else {
        const role = await User.changeRole("admin", req.params.id);
        return res.status(200).json({
          response: "l utilisateur est admin",
        });
      }
    } else {
      return res.status(403).json({
        response:
          "Accès refusé : tu n'es pas admin ou tu ne peut pas changer ton propre role",
      });
    }
  } catch (error) {
    // 4. Toujours gérer les erreurs potentielles (ex: ID malformé)
    res.status(500).json({ error: "Erreur serveur" });
  }
};

exports.getUsers = async (req, res) => {
  try {
    // 1. On récupère l'utilisateur (c'est déjà un objet JS)
    const user = await User.findById(req.auth.userId);

    // 2. On vérifie si l'utilisateur existe bien en base
    if (!user) {
      return res.status(404).json({ error: "Vous n'etes pas authentifié" });
    }

    const users = await User.getUsers();
    return res.status(200).json({
      response: users,
    });
  } catch (error) {
    // 4. Toujours gérer les erreurs potentielles (ex: ID malformé)
    res.status(500).json({ error: "Erreur serveur" });
  }
};
