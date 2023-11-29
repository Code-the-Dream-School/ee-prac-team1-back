const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');
const { parse, isValid } = require('date-fns');
const {
  BadRequestError,
  UnauthenticatedError,
  ConflictError,
} = require('../errors');
const nodemailer = require('nodemailer');
require('dotenv').config();

//Register Email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_KEY,
  },
});

const sendEmail = async (email, subject, html) => {
  const mailOptions = {
    from: '"PlayerBuddy" <ctd.ee.team1@gmail.com>',
    to: email,
    subject: subject,
    html: html,
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    if (
      firstName === '' ||
      lastName === '' ||
      email === '' ||
      password === ''
    ) {
      throw new BadRequestError('Fields cannot be empty');
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ConflictError('Email address is already in use');
    }
    const user = await User.create({ ...req.body });
    const token = user.createJWT();
    sendEmail(
      `${email}`,
      'Welcome to PlayerBuddy!',
      '<h1>Welcome to PlayerBuddy!</h1><p>You have been registered successfully.</p>',
    );

    res
      .status(StatusCodes.CREATED)
      .json({ user: { firstName: user.firstName }, token });
  } catch (error) {
    console.error(error);
    throw new BadRequestError(error.message);
  }
};

const finishRegistration = async (req, res) => {
  try {
    const { profileImage, phoneNumber, dateOfBirth, residentialAddress, experienceLevel } = req.body;

    const successMessages = [];

    if (profileImage && typeof profileImage === 'string') {
      successMessages.push('You added your profile image successfully');
    }

    if (phoneNumber && typeof phoneNumber === 'string') {
      successMessages.push('Your phone number is added successfully');
    }
    if (dateOfBirth) {
      const parsedDateOfBirth = parse(dateOfBirth, 'mm/dd/yyyy', new Date());
      if (isValid(parsedDateOfBirth)) {
        successMessages.push('Your date of birth is added successfully');
      }
    }
    if (residentialAddress && typeof residentialAddress === 'object') {
      if (
        residentialAddress.address && typeof residentialAddress.address === 'string' &&
        residentialAddress.city && typeof residentialAddress.city === 'string' &&
        residentialAddress.state && typeof residentialAddress.state === 'string' &&
        residentialAddress.zipCode && typeof residentialAddress.zipCode === 'number'
      ) {
        successMessages.push('You successfully added your residential address');
      }
    }
    if (
      experienceLevel &&
      typeof experienceLevel === 'string' &&
      ['Beginner', 'Intermediate', 'Advanced'].includes(experienceLevel)
    ) {
      successMessages.push('Your experience level is added successfully');
    }
    if (successMessages.length > 0) {
      return res.status(200).json({ messages: successMessages });
    }
    throw new BadRequestError('Invalid format or data not provided');
  } catch (error) {
    console.error('Finish Registration failed', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new BadRequestError('Please enter email address and password');
    }
    const user = await User.findOne({ email });

    if (!user) {
      throw new UnauthenticatedError(
        'Login failed! Please enter the email you registered with.',
      );
    }
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      throw new UnauthenticatedError(
        'Login failed! You entered Invalid Password!',
      );
    }
    const token = user.createJWT();
    res
      .status(StatusCodes.OK)
      .json({ user: { userId: user._id, firstName: user.firstName }, token });
  } catch (error) {
    console.error(error);
    res.status(StatusCodes.UNAUTHORIZED).json({ error: error.message });
  }
};

const logout = async (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
        return res.status(500).json({ error: 'Logout failed' });
      }

      res.json({ message: 'Logout successful' });
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
};

module.exports = { register, finishRegistration, login, logout };
