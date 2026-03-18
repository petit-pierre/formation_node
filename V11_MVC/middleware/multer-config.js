// revenons a une configutration de multer plus simple, sans S3, pour stocker les fichiers localement en attendant que le Worker les traite et les envoie vers S3/youtube
// en parralele nous lancerons un container docker pour redis via la commande:
// docker run -d --name redis-api -p 6379:6379 redis
// Ce qui nous evite d'avoir a installer redis sur notre machine

const multer = require("multer");
const path = require("path");

const MIME_TYPES = {
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
  "image/png": "png",
  "application/pdf": "pdf",
  "image/webp": "webp",
  "video/mp4": "mp4",
};

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    // Les fichiers seront stockés ici en attendant le Worker
    callback(null, "temp/");
  },
  filename: (req, file, callback) => {
    // On crée un nom unique pour éviter les collisions
    const extension = path.extname(file.originalname);
    const name = file.originalname.split(" ").join("_").replace(extension, "");
    const fileName = name + "_" + Date.now() + extension;
    req.fileName = fileName;
    callback(null, fileName);
  },
});

const fileFilter = (req, file, callback) => {
  if (MIME_TYPES[file.mimetype]) {
    callback(null, true);
  } else {
    callback(new Error("Format de fichier non supporté"), false);
  }
};

// nous changons le champ attendu de "image" à "file" pour être plus générique et pouvoir gérer aussi les vidéos

module.exports = multer({
  storage: storage,
  limits: { fileSize: 300 * 1024 * 1024 },
  fileFilter: fileFilter,
}).single("file");
