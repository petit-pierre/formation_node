const multer = require("multer");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { GetObjectCommand } = require("@aws-sdk/client-s3");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

// installons aussi googleapis pour l'upload YouTube
// npm install googleapis

const { google } = require("googleapis");

// On utilise le module "stream" de Node.js pour convertir le Buffer de Multer en un flux lisible pour l'API YouTube

const { Readable } = require("stream");

require("dotenv").config({ path: "../.env" });

const MIME_TYPES = {
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
  "image/png": "png",
  "application/pdf": "pdf",
  "image/webp": "webp",
  "video/mp4": "mp4", // On ajoute le MP4
};

const client = new S3Client({
  region: process.env.SCALEWAY_REGION,
  endpoint: process.env.SCALEWAY_ENDPOINT,
  credentials: {
    accessKeyId: process.env.SCALEWAY_ACCESS_KEY,
    secretAccessKey: process.env.SCALEWAY_SECRET_KEY,
  },
});

// Configuration du client OAuth2 pour YouTube

const oauth2Client = new google.auth.OAuth2(
  process.env.YOUTUBE_CLIENT_ID,
  process.env.YOUTUBE_CLIENT_SECRET,
  process.env.YOUTUBE_REDIRECT_URI,
);

oauth2Client.setCredentials({
  refresh_token: process.env.YOUTUBE_REFRESH_TOKEN,
});

const youtube = google.youtube({
  version: "v3",
  auth: oauth2Client,
});

const storage = multer.memoryStorage();

const fileFilter = (req, file, callback) => {
  if (MIME_TYPES[file.mimetype]) {
    callback(null, true);
  } else {
    callback(new Error("Format de fichier non supporté"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 300 * 1024 * 1024 },
}).single("image");

const uploadToS3 = (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    if (req.file) {
      try {
        const name = req.file.originalname.split(" ").join("_").split(".")[0];
        const extension = MIME_TYPES[req.file.mimetype];
        const finalFileName = `${name}_${Date.now()}.${extension}`;
        const command = new PutObjectCommand({
          Bucket: "paris",
          Key: `grp5/${finalFileName}`,
          Body: req.file.buffer,
          ContentType: req.file.mimetype,
        });
        await client.send(command);
        const getCommand = new GetObjectCommand({
          Bucket: "paris",
          Key: `grp5/${finalFileName}`,
        });
        const fileUrl = await getSignedUrl(client, getCommand);
        req.fileUrl = fileUrl;
        req.fileName = finalFileName;

        // youtube
        if (req.file.mimetype === "video/mp4") {
          console.log("Détection MP4 : Amorçage de l'upload YouTube...");
          try {
            // Conversion du Buffer Multer en Stream pour Google API
            const stream = new Readable();
            stream.push(req.file.buffer);
            stream.push(null);

            const response = await youtube.videos.insert({
              part: "snippet,status",
              requestBody: {
                snippet: {
                  title: finalFileName,
                  description: "Vidéo uploadée via API",
                  tags: ["recette", "cuisine"],
                  categoryId: "22", // 22 = People & Blogs
                },
                status: {
                  privacyStatus: "unlisted", // On la met en "non répertoriée" par défaut
                },
              },
              media: {
                body: stream,
              },
            });
            req.youtubeId = response.data.id;
          } catch (error) {
            console.error("Erreur YouTube Service:", error);
            throw new Error("Échec de l'upload YouTube");
          }
        }
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    }
    next();
  });
};

module.exports = uploadToS3;
