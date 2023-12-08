const express = require('express');
const router = express.Router();
const authenticateUser = require('../middleware/authentication');

const {
  getAllActivities,
  getActivity,
  createActivity,
  editActivity,
  deleteActivity,
  addUserToActivity,
  removeUserFromActivity,
  getCreatedActivities,
  getJoinedActivities,
  getAllOtherActivities
} = require('../controllers/activityController');


router.route('/')
  .get(getAllActivities);

router.route('/addMe/:id')
  .patch(authenticateUser, addUserToActivity);

router.route('/removeMe/:id')
  .patch(authenticateUser, removeUserFromActivity);

router.route('/myActivities')
  .post(authenticateUser, createActivity);

router.route('/myActivities/:id')
  .get(getActivity)
  .delete(authenticateUser, deleteActivity)
  .patch(authenticateUser, editActivity);

router.route('/createdActivities/:userId')
  .get(authenticateUser, getCreatedActivities);

router.route('/joinedActivities/:userId')
  .get(authenticateUser, getJoinedActivities);

router.route('/allOtherActivities/:userId')
  .get(authenticateUser, getAllOtherActivities);

module.exports = router;