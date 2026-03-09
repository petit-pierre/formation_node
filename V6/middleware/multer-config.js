// installons un nouveau node module pour gérer les fichiers uploadés : multer
// et créons un fichier de configuration pour multer dans le dossier middleware

const multer = require("multer");

// On définit les types MIME autorisés et leurs extensions correspondantes

const MIME_TYPES = {
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
  "image/png": "png",
  "application/pdf": "pdf",
  "image/webp": "webp",
};

// On configure le stockage des fichiers uploadés avec multer

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "images");
  },

// On génère un nom de fichier unique pour éviter les conflits

  filename: (req, file, callback) => {
    const name = file.originalname.split(" ").join("_");
    const extension = MIME_TYPES[file.mimetype];
    callback(null, name + Date.now() + "." + extension);
  },
});

// On exporte la configuration de multer pour l'utiliser dans les routes

module.exports = multer({ storage: storage }).single("image");