const express = require("express");
const infosCtrl = require("../controllers/infos.js");
const router = express.Router();

router.options("/", infosCtrl.infos);
router.get("/", infosCtrl.infos);
router.post("/", infosCtrl.infos);
router.put("/", infosCtrl.infos);
router.delete("/", infosCtrl.infos);

module.exports = router;