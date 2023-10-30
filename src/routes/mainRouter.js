const express = require("express");
const router = express.Router();
// const mainController = require("../controllers/mainController.js");
const { getAllActivities } = require("../controllers/mainController.js");

// router.get("/", mainController.get);
router.route("/").get(getAllActivities);

module.exports = router;
