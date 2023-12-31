const User = require('../models/User');
const Activity = require('../models/Activity');
const { StatusCodes } = require('http-status-codes');
const {
  BadRequestError,
  NotFoundError,
  UnauthenticatedError,
} = require('../errors');
const bcrypt = require('bcrypt');
const cloudinary = require('cloudinary');
const { formatImage } = require('../middleware/multer.js');

const getCurrentUser = async (req, res) => {
  const { userId } = req.user;
  const user = await User.findOne({ _id: userId }).select('-password');
  if (!user) {
    throw new NotFoundError(`No user with id ${userId}`);
  }
  res.status(StatusCodes.OK).json({ user });
};

const editUserProfile = async (req, res) => {
  try {
    const {
      experienceLevel,
      dateOfBirth,
      residentialAddress,
      profileImage,
      phoneNumber,
    } = req.body;
    const { userId } = req.user;

    const updateObject = {
      experienceLevel,
      dateOfBirth,
      residentialAddress,
      profileImage,
      phoneNumber,
    };

    if (req.file) {
      const file = formatImage(req.file);
      const response = await cloudinary.v2.uploader.upload(file);
      updateObject.profileImage = response.secure_url;
      updateObject.avatarPublicId = response.public_id;
    }

    {
      _id: userId;
    }
    updateObject, { new: true, runValidators: true };

    const user = await User.findByIdAndUpdate({ _id: userId }, updateObject, {
      new: true,
      runValidators: true,
    });

    // if (req.file && updateObject.avatarPublicId) {
    //   await cloudinary.v2.uploader.destroy(updateObject.avatarPublicId);
    // }

    if (!user) {
      throw new NotFoundError(`No user with id ${userId}`);
    }
    const newToken = user.createJWT();
    res.status(200).json({
      message: 'User account is updated successfully',
      token: newToken,
    });
  } catch (error) {
    console.error('Error in editUserProfile:', error);
    res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
  }
};

const deleteUserAccount = async (req, res) => {
  const userId = req.params.userId;
  try {
    const userToDelete = await User.findById(userId);
    if (!userToDelete) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: 'User not found' });
    }
    const activitiesToDelete = await Activity.find({
      createdBy: userId,
      players: userId,
    });
    for (const activity of activitiesToDelete) {
      await Activity.findOneAndDelete({ _id: activity._id });
    }
    const deletedUser = await User.findOneAndDelete({ _id: userId });
    if (!deletedUser) {
      throw new NotFoundError(`No user found with id ${userId}`);
    }
    res.status(200).json({ message: 'User account deleted successfully' });
  } catch (error) {
    console.error('An error occurred while deleting the user profile:', error);
    res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
  }
};

const updateUserPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    throw new BadRequestError('Please provide both values');
  }
  const user = await User.findOne({ _id: req.user.userId });

  const isPasswordCorrect = await user.comparePassword(oldPassword);
  if (!isPasswordCorrect) {
    throw new UnauthenticatedError('Invalid Credentials');
  }
  user.password = newPassword;

  await user.save();
  res.status(StatusCodes.OK).json({ msg: 'Success! Password Updated.' });
};

module.exports = {
  getCurrentUser,
  editUserProfile,
  deleteUserAccount,
  updateUserPassword,
};
