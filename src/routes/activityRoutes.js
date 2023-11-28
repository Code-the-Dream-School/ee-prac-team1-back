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
  addUserToActivity,
  removeUserFromActivity,
} = require('../controllers/activityController');


router.route('/')
  .get(getAllActivities);

router.route('/addMe/:id')
  .patch(authenticateUser, addUserToActivity);

router.route('/removeMe/:id')
  .patch(authenticateUser, removeUserFromActivity);

router.route('/myActivities')
  .get(authenticateUser, getMyActivities)
  .post(authenticateUser, createActivity);

router.route('/myActivities/:id')
  .get(getActivity)
  .delete(authenticateUser, deleteActivity)
  .patch(authenticateUser, editActivity);

module.exports = router;