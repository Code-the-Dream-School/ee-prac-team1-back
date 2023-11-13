const express = require("express");
const router = express.Router();

const {
  getAllActivities
} = require("../controllers/activities");

router.route("/")
  .get(getAllActivities);


module.exports = router;
