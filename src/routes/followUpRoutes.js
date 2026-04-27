const express = require("express");
const followUpController = require("../controllers/followUpController");

const router = express.Router();

router.post("/generate", followUpController.generate);

module.exports = router;
