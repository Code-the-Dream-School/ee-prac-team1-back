const User = require('../models/User');
const Activity = require('../models/Activity');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, UnauthenticatedError, ConflictError, NotFoundError } = require('../errors');
const bcrypt = require('bcrypt');

const editUserProfile = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            password,
            experienceLevel,
            dateOfBirth,
            address,
            profileImage,
            phoneNumber,
        } = req.body;
        const { userId } = req.user;
        if (
            firstName === '' ||
            lastName === '' ||
            email === '' ||
            experienceLevel === '' ||
            dateOfBirth === '' ||
            address === '' ||
            profileImage === '' ||
            phoneNumber === ''
        ) {
            throw new BadRequestError('Fields cannot be empty');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.findByIdAndUpdate(
            {
                _id: userId,
                createdBy: userId,
            },
            {
                firstName,
                lastName,
                email,
                password: hashedPassword,
                experienceLevel,
                dateOfBirth,
                address,
                profileImage,
                phoneNumber,
            },
            { new: true, runValidators: true }
        );
        if (!user) {
            throw new NotFoundError(`No user with id ${userId}`);
        }
        const newToken = user.createJWT();
        res.status(200).json({ message: 'User account is updated successfully', token: newToken, });
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
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'User not found' });
        }
        const activitiesToDelete = await Activity.find({ createdBy: userId, players: userId });
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

module.exports = { editUserProfile, deleteUserAccount };