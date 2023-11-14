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
} = require('../controllers/activities');

router.route('/').post(authenticateUser, createActivity).get(getAllActivities);

router
  .route('/:id')
  .get(getActivity)
  .delete(authenticateUser, deleteActivity)
  .patch(authenticateUser, editActivity);

router.route('/addMe/:id').patch(authenticateUser, addUserToActivity);
router.route('/removeMe/:id').patch(authenticateUser, removeUserFromActivity);

module.exports = router;
