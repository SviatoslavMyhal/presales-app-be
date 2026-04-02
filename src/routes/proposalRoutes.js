const express = require("express");
const proposalController = require("../controllers/proposalController");

const router = express.Router();

router.post("/generate", proposalController.generate);

module.exports = router;
