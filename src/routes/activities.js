const express = require("express");
const router = express.Router();

const {
  getActivity,
  createActivity,
  editActivity,
  deleteActivity,
} = require("../controllers/activities");

router.route("/").post(createActivity);
router
  .route("/:id")
  .get(getActivity)
  .delete(deleteActivity)
  .patch(editActivity);

module.exports = router;
