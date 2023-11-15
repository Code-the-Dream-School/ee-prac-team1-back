const express = require('express');
const router = express.Router();
const authenticateUser = require('../middleware/authentication');

const {
  getAllActivities,
  addUserToActivity,
  removeUserFromActivity,
} = require('../controllers/activities');

router.route('/').get(getAllActivities);
router.route('/addMe/:id').patch(authenticateUser, addUserToActivity);
router.route('/removeMe/:id').patch(authenticateUser, removeUserFromActivity);

module.exports = router;
