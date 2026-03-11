const multer = require("multer");

const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { GetObjectCommand } = require("@aws-sdk/client-s3");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

require("dotenv").config({ path: "../.env" });

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

    // Si aucun fichier n'est fourni, on continue sans faire d'upload

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
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    }
    next();
  });
};

module.exports = uploadToS3;
