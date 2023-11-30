const User = require('../models/User');
const Activity = require('../models/Activity');
const { StatusCodes } = require('http-status-codes');
const {
  BadRequestError,
  NotFoundError,
} = require('../errors');
const bcrypt = require('bcrypt');

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
      firstName,
      lastName,
      email,
      password,
      experienceLevel,
      dateOfBirth,
      residentialAddress,
      profileImage,
      phoneNumber,
    } = req.body;
    const { userId } = req.user;

    // Retrieve the current user's email from the database
    const existingUser = await User.findById(userId);
    const existingEmail = existingUser.email;

    // Check if email is unchanged or empty
    const shouldUpdateEmail = email && email !== existingEmail;

    // Check if other required fields are empty
    if (
      firstName === '' ||
      lastName === '' ||
      experienceLevel === '' ||
      dateOfBirth === '' ||
      residentialAddress === '' ||
      profileImage === '' ||
      phoneNumber === ''
    ) {
      throw new BadRequestError('Fields cannot be empty');
    }

    // Hash the password if provided
    const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

    // Construct the update object based on changed fields
    const updateObject = {
      firstName,
      lastName,
      experienceLevel,
      dateOfBirth,
      residentialAddress,
      profileImage,
      phoneNumber,
      ...(shouldUpdateEmail && { email }),
      ...(hashedPassword && { password: hashedPassword }),
    };
    { _id: userId }
    updateObject,
      { new: true, runValidators: true }

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

module.exports = { getCurrentUser, editUserProfile, deleteUserAccount };
