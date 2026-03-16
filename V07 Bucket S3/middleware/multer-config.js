const multer = require("multer");

// modifions pour utiliser notre bucket S3
// npm install @aws-sdk/s3-request-presigner
// npm install @aws-sdk/client-s3

const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { GetObjectCommand } = require("@aws-sdk/client-s3");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

// Nous avons besoin de charger les variables d'environnement pour accéder à S3

require('dotenv').config({ path: '../.env' });

const MIME_TYPES = {
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
  "image/png": "png",
  "application/pdf": "pdf",
  "image/webp": "webp",
};

// Configuration du client S3

const client = new S3Client({
    region: process.env.SCALEWAY_REGION,
    endpoint: process.env.SCALEWAY_ENDPOINT,
    credentials: {
        accessKeyId: process.env.SCALEWAY_ACCESS_KEY,
        secretAccessKey: process.env.SCALEWAY_SECRET_KEY,
    },
});

// Configuration de multer pour stocker les fichiers en mémoire avant de les envoyer à S3

const storage = multer.memoryStorage();

// Filtre pour n'accepter que les types de fichiers définis dans MIME_TYPES

const fileFilter = (req, file, callback) => {
  if (MIME_TYPES[file.mimetype]) {
    callback(null, true);
  } else {
    callback(new Error("Format de fichier non supporté"), false);
  }
};

// fonction qui gère l'upload du fichier vers S3 et qui génère une URL présignée pour accéder au fichier après l'upload

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 300 * 1024 * 1024 }
}).single("image");

const uploadToS3 = (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: "Aucun fichier fourni" });
    }

    try {
      const name = req.file.originalname.split(" ").join("_").split(".")[0];
      const extension = MIME_TYPES[req.file.mimetype];
      const finalFileName = `${name}_${Date.now()}.${extension}`;

// Nous utilisons ici la methode putObject de S3 pour envoyer le fichier à notre bucket, en utilisant le buffer de multer

      const command = new PutObjectCommand({
        Bucket: "paris",
        Key: `grp5/${finalFileName}`,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      });

      await client.send(command);
      
      // Génère une URL présignée pour accéder au fichier
      
      const getCommand = new GetObjectCommand({
        Bucket: "paris",
        Key: `grp5/${finalFileName}`,
      });
      const fileUrl = await getSignedUrl(client, getCommand);
      
      req.fileUrl = fileUrl; // URL complète présignée
      req.fileName = finalFileName; // Nom du fichier
      next();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
};

module.exports = uploadToS3;