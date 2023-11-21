const express = require('express');
const router = express.Router();
const authenticateUser = require('../middleware/authentication');

const {
  getCurrentUser,
  editUserProfile,
  deleteUserAccount,
} = require('../controllers/userController');

router.get('/current-user', authenticateUser, getCurrentUser);
router.delete('/:userId', authenticateUser, deleteUserAccount);
router.patch('/:userId', authenticateUser, editUserProfile);

module.exports = router;
