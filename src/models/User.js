const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "First name is required"],
    maxlength: 20,
  },
  lastName: {
    type: String,
    required: [true, "Last name is required"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    match: [
      /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/,
      "Please provide a valid email address",
    ],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: 6,
  },
  experienceLevel: {
    type: String,
    enum: ["Beginner", "Intermediate", "Advanced"],
  },
  activities: [{ type: mongoose.Schema.Types.ObjectId, ref: "Activity" }],
  dateOfBirth: Date, //YYYY-MM-DD
  address: {
    houseAptNum: String,
    street: String,
    city: String,
    state: String,
    zipCode: String,
  },
  profileImage: String,
  phoneNumber: {
    type: String,
    unique: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

UserSchema.pre("save", async function () {
  const salt = await bcrypt.genSalt(10); // hashing the password
  this.password = await bcrypt.hash(this.password, salt);
});
UserSchema.pre("remove", async function (next) {
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

module.exports = mongoose.model("User", UserSchema);
