const express = require("express");
const requireAuth = require("../middleware/requireAuth");
const briefingController = require("../controllers/briefingController");

const router = express.Router();

router.post("/", requireAuth, briefingController.create);

module.exports = router;
