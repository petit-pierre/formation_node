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
    callback(null, "V12_CRON/temp/");
  },
  filename: (req, file, callback) => {
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

module.exports = multer({
  storage: storage,
  limits: { fileSize: 300 * 1024 * 1024 },
  fileFilter: fileFilter,
}).single("file");
