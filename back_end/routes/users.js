const express = require("express");
const auth = require("../middleware/auth");
const userCtrl = require("../controllers/users.js");
const router = express.Router();

router.options("/", userCtrl.optionsUsers);
router.post("/sign_up", userCtrl.sign_up);
router.post("/log_in", userCtrl.log_in);
router.patch("/:id", auth, userCtrl.changeRole);
router.get("/", auth, userCtrl.getUsers);

module.exports = router;
