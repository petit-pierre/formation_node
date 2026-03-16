require("dotenv").config({ path: "../.env" });
const {
  S3Client,
  PutObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { GetObjectCommand } = require("@aws-sdk/client-s3");

const MIME_TYPES = {
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
  "image/png": "png",
  "application/pdf": "pdf",
  "image/webp": "webp",
};

const client = new S3Client({
  region: process.env.SCALEWAY_REGION,
  endpoint: process.env.SCALEWAY_ENDPOINT,
  credentials: {
    accessKeyId: process.env.SCALEWAY_ACCESS_KEY,
    secretAccessKey: process.env.SCALEWAY_SECRET_KEY,
  },
});

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

exports.listFolders = async (req, res, next) => {
  try {
    const command = new ListObjectsV2Command({
      Bucket: "paris",
      Prefix: "grp5/",
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
        });
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

exports.deleteFile = async (req, res, next) => {
  try {
    const { key } = req.params;
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
