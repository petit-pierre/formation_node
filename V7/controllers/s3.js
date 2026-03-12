// Nous allons utiliser le SDK AWS pour interagir avec S3
// Ce controller gère les opérations de base : upload, listing et suppression de fichiers dans un bucket S3

require("dotenv").config({ path: "../.env" });
const {
  S3Client,
  PutObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { GetObjectCommand } = require("@aws-sdk/client-s3");

// Puisque cette route de test ne passe pas par multer, nous devons declarer les types MIME autorisés et les extensions correspondantes pour générer un nom de fichier correct

const MIME_TYPES = {
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
  "image/png": "png",
  "application/pdf": "pdf",
  "image/webp": "webp",
};

// Configuration du client S3 avec les informations d'identification et l'endpoint de Scaleway

const client = new S3Client({
  region: process.env.SCALEWAY_REGION,
  endpoint: process.env.SCALEWAY_ENDPOINT,
  credentials: {
    accessKeyId: process.env.SCALEWAY_ACCESS_KEY,
    secretAccessKey: process.env.SCALEWAY_SECRET_KEY,
  },
});

// Cette fonction gère l'upload d'un fichier vers le bucket S3, elle utilise la commande PutObjectCommand pour envoyer le fichier à S3.

exports.send = async (req, res) => {
  if (!req.file) return res.status(400).send("Fichier manquant");
  const name = req.file.originalname.split(" ").join("_").split(".")[0];
  const extension = MIME_TYPES[req.file.mimetype];
  const finalFileName = `${name}_${Date.now()}.${extension}`;
  const command = new PutObjectCommand({
    Bucket: "paris",
    Key: `grp5/${finalFileName}`,
    Body: req.file.buffer,
    ContentType: req.file.mimetype,
  });
  try {
    await client.send(command);
    res.status(201).json({ message: "Upload réussi !", url: finalFileName });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Cette fonction liste les fichiers présents dans le bucket S3, elle utilise la commande ListObjectsV2Command pour récupérer les objets et génère des URLs signées pour chaque fichier afin de permettre leur téléchargement.

exports.listFolders = async (req, res, next) => {
  try {
    const command = new ListObjectsV2Command({
      Bucket: "paris",
      Prefix: "grp5/", // Retourne uniquement les fichiers dans le dossier "grp5/"
    });
    const response = await client.send(command);
    const filesWithUrls = await Promise.all(
      (response.Contents || []).map(async (file) => {
        const getObjectCommand = new GetObjectCommand({
          Bucket: "paris",
          Key: file.Key,
        });
        const url = await getSignedUrl(client, getObjectCommand, {
          expiresIn: 3600,
        }); // URL valide 1 heure
        return {
          name: file.Key,
          size: file.Size,
          lastModified: file.LastModified,
          url: url,
        };
      }),
    );
    res.status(200).json({
      files: filesWithUrls,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
    next(error);
  }
};

// Cette fonction supprime un fichier du bucket S3, elle utilise la commande DeleteObjectCommand pour supprimer le fichier spécifié par sa clé.

exports.deleteFile = async (req, res, next) => {
  try {
    const { key } = req.params; // Clé du fichier à supprimer (ex: "grp5/fichier.jpg")
    const command = new DeleteObjectCommand({
      Bucket: "paris",
      Key: key,
    });
    await client.send(command);
    res.status(200).json({ message: "Fichier supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ error: error.message });
    next(error);
  }
};
