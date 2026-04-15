const connexion = require("../utils/db");

const User = {
  // Trouver un utilisateur par son username
  findByUsername: async (username) => {
    const [rows] = await connexion.execute(
      "SELECT id, username, password, role FROM users WHERE username = ?",
      [username],
    );
    return rows[0];
  },

  // Trouver un utilisateur par son id
  findById: async (id) => {
    const [rows] = await connexion.execute(
      "SELECT role FROM users WHERE id = ?",
      [id],
    );
    return rows[0];
  },

  // Trouver tout les utilisateurs
  getUsers: async (id) => {
    const [rows] = await connexion.execute(
      "SELECT id,username,role FROM users ",
    );
    return rows;
  },

  // Toggle admin un user
  changeRole: async (role, id) => {
    const [rows] = await connexion.execute(
      "UPDATE users SET role = ? WHERE id = ?",
      [role, id],
    );
    return true;
  },

  // Créer un nouvel utilisateur
  create: async (username, hashedPassword) => {
    const sql = "INSERT INTO users (username, password) VALUES (?, ?)";
    const [result] = await connexion.execute(sql, [username, hashedPassword]);
    return result.insertId;
  },
};

module.exports = User;
