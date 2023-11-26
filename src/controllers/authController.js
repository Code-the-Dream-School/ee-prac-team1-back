const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const {
  BadRequestError,
  UnauthenticatedError,
  ConflictError,
  NotFoundError,
} = require("../errors");
const nodemailer = require("nodemailer");
const bodyParser = require('body-parser');
const crypto = require('crypto');
require('dotenv').config();


//Register Email
const transporter =  nodemailer.createTransport({
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
    console.error("Error sending email:", error);
  }
};

// const sendVerificationEmail = async (email, token) => {
//   const mailOptions = {
//     from: '"Verification Team" <noreply@example.com>',
//     to: email,
//     subject: "Email Verification",
//     html: `
//       <p>Thank you for registering!</p>
//       <p>Please click the following link to verify your email:</p>
//       <a href="http://localhost:3000/verify/${token}">Verify Email</a>
//     `,
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     console.log("Verification email sent successfully");
//   } catch (error) {
//     console.error("Error sending verification email:", error);
//   }
// };

//Reset Password
function generateResetToken() {
  const token = crypto.randomBytes(20).toString('hex');
  const expirationTime = new Date();
  expirationTime.setMinutes(expirationTime.getMinutes() + 15); // Token expires in 15 minutes
  return { token, expirationTime };
}

// Send reset password email
function sendResetEmail(user) {
  const { token, expirationTime } = generateResetToken();
  user.resetToken = { token, expirationTime };

  sendEmail(
      `${user.email}`,
      'Password Reset Request',
      `Click the following link to reset your password: http://localhost:8000/api/v1/auth/reset-password/${token}`,
  );

  // const mailOptions = {
  //   from: 'tammam.wafai@gmail.com',
  //   to: user.email,
  //   subject: 'Password Reset Request',
  //   text: `Click the following link to reset your password: http://localhost:3000/reset-password/${resetToken}`,
  // };

  // transporter.sendMail(mailOptions, (error, info) => {
  //   if (error) {
  //     console.log(error);
  //   } else {
  //     console.log('Email sent: ' + info.response);
  //   }
  // });


}

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  

if (!email) {
      throw new BadRequestError("Please enter email address");
    }
    const user = await User.findOne({ email });

    if (!user) {
      throw new UnauthenticatedError(
        "Login failed! Please enter the email you registered with.",
      );
    }

  if (user) {
    sendResetEmail(user);
    res.json({ message: 'Password reset email sent successfully.' });
  } else {
    res.status(404).json({ error: 'User not found.' });
  }
};

const resetPassword =async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;
  console.log(token, newPassword);

  // const user = users.find((u) => u.resetToken.token === token && new Date() < new Date(u.resetToken.expirationTime));

if (!newPassword) {
      throw new BadRequestError("Please enter newPassword");
    }
    const user = await User.findOne({ resetToken:token });

    if (!user) {
      throw new UnauthenticatedError(
        "Login failed! Please enter the email you registered with.",
      );
    }
  if (user) {
    // Update the user's password in the database
    user.password = newPassword;
    user.resetToken = null;

    res.json({ message: 'Password reset successful.' });
  } else {
    res.status(404).json({ error: 'Invalid or expired token.' });
  }
};

const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    if (
      firstName === "" ||
      lastName === "" ||
      email === "" ||
      password === ""
    ) {
      throw new BadRequestError("Fields cannot be empty");
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ConflictError("Email address is already in use");
    }
    const user = await User.create({ ...req.body });
    const token = user.createJWT();
    sendEmail(
      `${email}`,
      "Welcome to PlayerBuddy!",
      "<h1>Welcome to PlayerBuddy!</h1><p>You've been registered successfully.</p>",
    );

    // sendVerificationEmail("tammam.wafai@gmail.com", "12345678");
    res
      .status(StatusCodes.CREATED)
      .json({ user: { firstName: user.firstName }, token });
  } catch (error) {
    console.error(error);
    throw new BadRequestError(error.message);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new BadRequestError("Please enter email address and password");
    }
    const user = await User.findOne({ email });

    if (!user) {
      throw new UnauthenticatedError(
        "Login failed! Please enter the email you registered with.",
      );
    }
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      throw new UnauthenticatedError(
        "Login failed! You entered Invalid Password!",
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

module.exports = { register, login, logout,forgotPassword,resetPassword };
