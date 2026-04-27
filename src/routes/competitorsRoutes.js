const express = require("express");
const competitorsController = require("../controllers/competitorsController");

const router = express.Router();

router.post("/generate", competitorsController.generate);

module.exports = router;
