const express = require('express');
const router = express.Router();
const authenticateUser = require('../middleware/authentication');

const {
  getAllActivities,
  getMyActivities,
  getActivity,
  createActivity,
  editActivity,
  deleteActivity,
} = require('../controllers/activityController');

router.route('/')
  .get(getAllActivities);

router.route('/myActivities')
  .get(authenticateUser, getMyActivities)
  .post(authenticateUser, createActivity);

router.route('/myActivities/:id')
  .get(authenticateUser, getActivity)
  .delete(authenticateUser, deleteActivity)
  .patch(authenticateUser, editActivity);


module.exports = router;