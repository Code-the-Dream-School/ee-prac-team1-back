const express = require("express");
const router = express.Router();

const {
  getAllActivities,
  getMyActivities,
  getActivity,
  createActivity,
  editActivity,
  deleteActivity,
} = require("../controllers/activities");

router.route("/")
  .get(getAllActivities)

router.route("/activities")
  .get(getMyActivities)
  .post(createActivity);

router.route("/activities/:id")
  .get(getActivity)
  .delete(deleteActivity)
  .patch(editActivity);


module.exports = router;
