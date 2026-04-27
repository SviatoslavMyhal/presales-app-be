const express = require("express");
const objectionsController = require("../controllers/objectionsController");

const router = express.Router();

router.post("/generate", objectionsController.generate);

module.exports = router;
