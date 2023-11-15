const User = require("../models/User");
const Activity = require('../models/Activity');
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, UnauthenticatedError, ConflictError, NotFoundError } = require("../errors");
const bcrypt = require('bcrypt');

const register = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
    } = req.body;
    if (
      firstName === "" ||
      lastName === "" ||
      email === "" ||
      password === ""
    ) {
      throw new BadRequestError("Fields cannot be empty");
    };
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ConflictError("Email address is already in use");
    }
    const user = await User.create({ ...req.body });
    const token = user.createJWT();
    res.status(StatusCodes.CREATED).json({ user: { firstName: user.firstName }, token });
  } catch (error) {
    console.error(error);
    throw new BadRequestError(error.message);
  }
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
      address,
      profileImage,
      phoneNumber,
    } = req.body;
    const { userId } = req.user;
    if (
      firstName === "" ||
      lastName === "" ||
      email === "" ||
      experienceLevel === "" ||
      dateOfBirth === "" ||
      address === "" ||
      profileImage === "" ||
      phoneNumber === ""
    ) {
      throw new BadRequestError("Fields cannot be empty");
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
    console.error("Error in editUserProfile:", error);
    res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
  }
};

const login = async (req, res) => {
  try {
    //initial checking
    const { email, password } = req.body;

    if (!email || !password) {
      throw new BadRequestError("Please enter email address and password");
    }
    // checking user existence in DB, if user exist- we send back a response with a user name and token, if no- we send an (unauthenticated) error as user entered not valid credentials;
    const user = await User.findOne({ email });

    if (!user) {
      throw new UnauthenticatedError(
        "Login failed! Please enter the email you registered with."
      );
    }
    // comparing hashed passwords
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      throw new UnauthenticatedError(
        "Login failed! You entered Invalid Password!"
      );
    }
    // creating token if user exist in DB
    const token = user.createJWT();
    res.status(StatusCodes.OK).json({ user: { userId: user._id, firstName: user.firstName }, token });
  } catch (error) {
    console.error(error);
    res.status(StatusCodes.UNAUTHORIZED).json({ error: error.message });
  }
};
const logout = async (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
        return res.status(500).json({ error: "Logout failed" });
      }

      res.json({ message: "Logout successful" });
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Logout failed" });
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

module.exports = { register, login, logout, editUserProfile, deleteUserAccount };
