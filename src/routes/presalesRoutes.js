const express = require("express");
const presalesController = require("../controllers/presalesController");

const router = express.Router();

router.post("/analyze", presalesController.analyze);

module.exports = router;
