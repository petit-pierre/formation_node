// Nous aurons besoin du module jsonwebtoken pour gérer les tokens d'authentification

const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {

    // On recupere le token présent dans les headers d'autorisation

    const token = req.headers.authorization.split(" ")[1];

    // On vérifie le token et on extrait le userId qui y est encodé

    const decodedToken = jwt.verify(token, "RANDOM_TOKEN_SECRET");
    const userId = decodedToken.userId;
    req.auth = {
      userId: userId,
    };
    next();
  } catch (error) {

    // En cas d'erreur (token invalide, etc.), on renvoie une erreur 401 Unauthorized
    
    res.status(401).json({ error });
  }
};