const express = require("express");
const presalesController = require("../controllers/presalesController");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

router.post("/analyze", presalesController.analyze);
router.post("/analyze/save", requireAuth, presalesController.analyzeSave);
router.post("/prescreen", presalesController.prescreen);

module.exports = router;
