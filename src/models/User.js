const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "First name is required"],
    maxlength: 50,
  },
  lastName: {
    type: String,
    required: [true, "Last name is required"],
    maxlength: 50,
  },
  username: {
    type: String,
    required: [true, "Username is required"],
    unique: true,
    minlength: 3,
    maxlength: 50,
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
  experience: Number,
  activities: [{ type: mongoose.Schema.Types.ObjectId, ref: "Activity" }],
  dateOfBirth: Date,
  address: {
    houseAptNum: String,
    street: String,
    city: String,
    state: String,
    zipCode: String,
  },
  profileImage: String,
  phoneNumber: String,
});

module.exports = mongoose.model("User", UserSchema);
