const express = require("express");
const publicBriefingController = require("../controllers/publicBriefingController");

const router = express.Router();

router.get("/:slug", publicBriefingController.getBySlug);

module.exports = router;
