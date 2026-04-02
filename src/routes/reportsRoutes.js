const express = require("express");
const reportsController = require("../controllers/reportsController");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

router.use(requireAuth);

router.post("/", reportsController.create);
router.get("/", reportsController.list);
router.delete("/:id", reportsController.removeById);
router.get("/:id", reportsController.getById);

module.exports = router;
