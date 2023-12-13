const User = require('../models/User');
const crypto = require('crypto');
const mongoose = require('mongoose');
const { StatusCodes } = require('http-status-codes');
const { parse, isValid } = require('date-fns');
const { BadRequestError, UnauthenticatedError, ConflictError } = require('../errors');
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

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const origin = req.headers['origin'];
    if (!email) {
      throw new BadRequestError('Please enter email address');
    }
    const user = await User.findOne({ email });
    if (!user) {
      throw new UnauthenticatedError('No account with that email address');
    }
    // Generate a verification code
    const verificationCode = crypto.randomBytes(4).toString('hex');
    // Update the user with the verification code
    user.verificationCode = verificationCode;
    await user.save();
    const verificationUrl = `${origin}/resetPassword/${verificationCode}/${email}`;
    // Modify the email template to include a button with the verification URL
    const emailBody = `
      <h1>Reset Password!</h1>
      <p>We've received your request to reset password. Click the button below to proceed:</p>
      <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #FF0101; color: white; text-decoration: none;">Reset Password</a>
    `;
    // Send the email
    sendEmail(email, 'Reset Password request recieved!', emailBody);
    res.status(StatusCodes.OK).json({
      msg: 'Reset password email sent!',
    });
  } catch (error) {
    console.error(error);
    res.status(StatusCodes.UNAUTHORIZED).json({ error: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const newPassword = req.body.newPassword;
    const resetCode = req.params.resetCode;
    const email = req.body.email;
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      throw new NotFoundError('User not found');
    }
    if (!newPassword) {
      throw new BadRequestError('Please provide newPassword');
    }
    // Check if the verification code matches the one stored in the database
    if (resetCode !== existingUser.verificationCode) {
      throw new BadRequestError('Invalid reset code');
    }
    // At this point, the verification code is valid
    existingUser.password = newPassword;
    await existingUser.save();

    const emailBody = `
      <h1>✓ Password has been changed successfully!</h1>
      <h3>Have fun using PlayerBuddy!</h3>
      <h3>Please contact our customer service if you have any questions: </h3> 
      <a href='mailto:ctd.ee.team1@gmail.com'>ctd.ee.team1@gmail.com</a>
      `;
    // Send the email
    sendEmail(email, 'Password Changed!', emailBody);

    res.status(StatusCodes.OK).json({ message: 'Reset password successful!' });
  } catch (error) {
    console.error(error);
    res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
  }
};

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
    if (firstName === '' || lastName === '' || email === '' || password === '') {
      throw new BadRequestError('Fields cannot be empty');
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ConflictError('Email address is already in use');
    }

    // Generate a verification code
    const verificationCode = crypto.randomBytes(4).toString('hex');

    // Update the user with the verification code
    const user = await User.create({ ...req.body, verificationCode });

    const origin = req.headers['origin'];

    // Create a verification URL with the code
    const verificationUrl = `${origin}/verifyCode/${verificationCode}/${email}`;

    // Modify the email template to include a button with the verification URL
    const emailBody = `
      <h1>Welcome to PlayerBuddy!</h1>
      <p>You've been registered successfully. Click the button below to verify your email:</p>
      <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none;">Verify Email</a>
    `;

    // Send the email
    sendEmail(email, 'Welcome to PlayerBuddy! Verify Your Email', emailBody);

    const token = user.createJWT();

    res.status(StatusCodes.CREATED).json({
      user: {
        userId: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      token,
    });
  } catch (error) {
    console.error(error);
    throw new BadRequestError(error.message);
  }
};
const finishRegistration = async (req, res) => {
  try {
    const { profileImage, phoneNumber, dateOfBirth, residentialAddress, experienceLevel } = req.body;
    const userId = req.user.userId;
    const updateMessages = [];
    let parsedDateOfBirth;

    if (profileImage && typeof profileImage === 'string') {
      updateMessages.push('You added your profile image successfully');
    }

    if (phoneNumber && typeof phoneNumber === 'string') {
      updateMessages.push('Your phone number is added successfully');
    }
    if (dateOfBirth) {
      parsedDateOfBirth = parse(dateOfBirth, 'mm/dd/yyyy', new Date());
      if (isValid(parsedDateOfBirth)) {
        updateMessages.push('Your date of birth is added successfully');
      }
    }
    if (residentialAddress && typeof residentialAddress === 'object') {
      if (
        residentialAddress.address &&
        typeof residentialAddress.address === 'string' &&
        residentialAddress.city &&
        typeof residentialAddress.city === 'string' &&
        residentialAddress.state &&
        typeof residentialAddress.state === 'string' &&
        residentialAddress.zipCode &&
        typeof residentialAddress.zipCode === 'number'
      ) {
        updateMessages.push('You successfully added your residential address');
      }
    }
    if (
      experienceLevel &&
      typeof experienceLevel === 'string' &&
      ['Beginner', 'Intermediate', 'Advanced'].includes(experienceLevel)
    ) {
      updateMessages.push('Your experience level is added successfully');
    }

    if (updateMessages.length > 0) {
      const updatedUser = await User.findOneAndUpdate(
        { _id: userId },
        {
          profileImage,
          phoneNumber,
          dateOfBirth: parsedDateOfBirth,
          residentialAddress,
          experienceLevel,
        },
        { new: true },
      );
      return res.status(200).json({
        updatedUser: { _id: updatedUser._id },
        messages: updateMessages,
      });
    }
  } catch (error) {
    console.error('Finish Registration failed', error);
    if (error instanceof BadRequestError) {
      return res.status(400).json({ error: 'Invalid format or data not provided' });
    } else {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
};
const verifyCode = async (req, res) => {
  try {
    const email = req.body.email;
    const verificationCode = req.params.verificationCode;
    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      throw new NotFoundError('User not found');
    }

    // Check if the verification code matches the one stored in the database
    if (verificationCode !== existingUser.verificationCode) {
      throw new BadRequestError('Invalid verification code');
    }

    // Set "verificationCode" to an empty string and "isVerified" to true
    existingUser.verificationCode = '';
    existingUser.isVerified = true;

    // Save the updated user document
    await existingUser.save();

    const emailBody = `
      <h1>✓ Your email address has been verified successfully!</h1>
      <h3>Have fun using PlayerBuddy!</h3>
      `;
    // Send the email
    sendEmail(email, 'Account verified!', emailBody);

    // At this point, the verification code is valid, and the user's document is updated
    res.status(StatusCodes.OK).json({ message: `${existingUser.firstName}, Thanks for verifying your email address` });
  } catch (error) {
    console.error(error);
    res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
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
      throw new UnauthenticatedError('Login failed! Please enter the email you registered with.');
    }
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      throw new UnauthenticatedError('Login failed! You entered Invalid Password!');
    }
    const token = user.createJWT();
    res.status(StatusCodes.OK).json({
      user: {
        userId: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      token,
    });
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

module.exports = {
  register,
  finishRegistration,
  login,
  logout,
  verifyCode,
  forgotPassword,
  resetPassword,
};
