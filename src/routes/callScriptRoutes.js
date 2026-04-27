const express = require("express");
const callScriptController = require("../controllers/callScriptController");

const router = express.Router();

router.post("/generate", callScriptController.generate);

module.exports = router;
