const express = require("express");
const router = express.Router();
const controller = require("../controllers/analyticsController");
const requireAuth = require("../middleware/requireAuth");

router.use(requireAuth);

router.get("/summary", controller.getSummary);

module.exports = router;
