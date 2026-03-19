const connexion = require("../utils/db");

const User = {
  // Trouver un utilisateur par son username
  findByUsername: async (username) => {
    const [rows] = await connexion.execute(
      "SELECT id, username, password FROM users WHERE username = ?",
      [username],
    );
    return rows[0];
  },

  // Créer un nouvel utilisateur
  create: async (username, hashedPassword) => {
    const sql = "INSERT INTO users (username, password) VALUES (?, ?)";
    const [result] = await connexion.execute(sql, [username, hashedPassword]);
    return result.insertId;
  },
};

module.exports = User;
