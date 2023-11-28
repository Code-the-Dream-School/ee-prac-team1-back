const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    maxlength: 20,
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [
      /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/,
      'Please provide a valid email address',
    ],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 8,
    validate: {
      validator: function (password) {
        return /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/.test(
          password
        );
      },
      message:
        'Password must be at least 8 characters long, contain a lowercase letter, an uppercase letter, and a number or special character.',
    },
  },
  experienceLevel: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
  },
  activities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Activity' }],
  dateOfBirth: {
    type: Date, //YYYY-MM-DD
  },
  residentialAddress: {
    address: {
      type: String,
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    zipCode: {
      type: String,
    },
  },
  profileImage: {
    type: String,
  },
  phoneNumber: {
    type: String,
  },
});

UserSchema.pre('save', async function () {
  const salt = await bcrypt.genSalt(10); // hashing the password
  this.password = await bcrypt.hash(this.password, salt);
});
UserSchema.pre('remove', async function (next) {
  const user = this;
  await Activity.deleteMany({ createdBy: user._id });
  next();
});
UserSchema.methods.createJWT = function () {
  return jwt.sign(
    {
      userId: this._id,
      name: this.name,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_LIFETIME }
  );
};

UserSchema.methods.comparePassword = async function (enteredPassword) {
  try {
    const isMatch = await bcrypt.compare(enteredPassword, this.password);
    return isMatch;
  } catch (error) {
    throw error;
  }
};

module.exports = mongoose.model('User', UserSchema);
