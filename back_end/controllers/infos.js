exports.infos = async (req, res, next) => {
  res
    .status(200)
    .end(
      "<html><head><meta charset='utf-8' /></head><body><h1>Bienvenue sur l'API de recettes de cuisine !</h1><p>Cette API vous permet de créer, lire, mettre à jour et supprimer des recettes de cuisine. Vous pouvez également consulter les informations sur l'API et les routes disponibles.</p><h2>Routes disponibles :</h2><p>recettes</p><ul><li>POST /recettes : Créer une nouvelle recette (authentification requise)</li><li>GET /recettes/:id : Récupérer une recette par son ID</li><li>GET /recettes : Récupérer toutes les recettes</li><li>PUT /recettes/:id : Mettre à jour une recette par son ID (authentification requise)</li><li>DELETE /recettes/:id : Supprimer une recette par son ID (authentification requise)</li></ul><p>users</p><ul><li>POST /users/sign_up : Créer un nouvel utilisateur</li><li>POST /users/log_in : Se connecter</li></ul><p>s3</p><ul><li>POST /s3 : Upload un fichier (formData)</li><li>DELETE /s3/:key : Supprimer un fichier</li><li>GET /s3 : Lister les fichiers</li></ul></body></html>",
    );
};
