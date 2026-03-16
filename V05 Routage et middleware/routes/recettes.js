const express = require("express");
const recettesCtrl = require("../controllers/recettes.js");
const auth = require("../middleware/auth");
const router = express.Router();

router.options("/", recettesCtrl.optionsRecettes);

router.post("/", auth, recettesCtrl.createRecettes);

router.get("/:id", recettesCtrl.getRecette);

router.get("/", recettesCtrl.getRecettes);

router.put("/:id", auth, recettesCtrl.putRecettes);

router.delete("/:id", auth, recettesCtrl.deleteRecettes);

module.exports = router;