const express = require("express");
const s3Ctrl = require("../controllers/s3.js");
const router = express.Router();
const auth = require("../middleware/auth");
const multer = require("../middleware/multer-config");

router.get("/", s3Ctrl.listFolders);
router.delete("/:key", auth, s3Ctrl.deleteFile);

module.exports = router;
