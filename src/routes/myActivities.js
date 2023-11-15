const express = require('express');
const router = express.Router();

const {
  getMyActivities,
  getActivity,
  createActivity,
  editActivity,
  deleteActivity,
} = require('../controllers/activities');

router.route('/').get(getMyActivities).post(createActivity);

router
  .route('/:id')
  .get(getActivity)
  .delete(deleteActivity)
  .patch(editActivity);

module.exports = router;
