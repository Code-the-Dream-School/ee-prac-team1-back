const express = require('express');
const router = express.Router();
const authenticateUser = require('../middleware/authentication');
const { upload } = require('../middleware/multer.js');

const {
  getCurrentUser,
  editUserProfile,
  deleteUserAccount,
  updateUserPassword,
} = require('../controllers/userController');

router.get('/current-user', authenticateUser, getCurrentUser);
router.delete('/:userId', authenticateUser, deleteUserAccount);
router.patch(
  '/updateUser',
  upload.single('profileImage'),
  authenticateUser,
  editUserProfile
);
router.patch('/updateUserPassword', authenticateUser, updateUserPassword);

module.exports = router;
