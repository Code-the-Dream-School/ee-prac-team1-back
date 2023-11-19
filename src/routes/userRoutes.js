const express = require('express');
const router = express.Router();
const authenticateUser = require('../middleware/authentication');

const { editUserProfile, deleteUserAccount } = require('../controllers/userController');

router.delete('/:userId', authenticateUser, deleteUserAccount);
router.patch('/:userId', authenticateUser, editUserProfile);

module.exports = router;
