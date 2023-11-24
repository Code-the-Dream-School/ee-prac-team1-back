const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const {
  BadRequestError,
  UnauthenticatedError,
  ConflictError,
  NotFoundError,
} = require("../errors");

const nodemailer = require("nodemailer");

const transporter =  nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: "tammam.wafai@gmail.com",
    pass: "aiun gghq zcaq asrj",
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
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

const sendVerificationEmail = async (email, token) => {
  const mailOptions = {
    from: '"Verification Team" <noreply@example.com>',
    to: email,
    subject: "Email Verification",
    html: `
      <p>Thank you for registering!</p>
      <p>Please click the following link to verify your email:</p>
      <a href="http://localhost:3000/verify/${token}">Verify Email</a>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Verification email sent successfully");
  } catch (error) {
    console.error("Error sending verification email:", error);
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

module.exports = { register, login, logout };
