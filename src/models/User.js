const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide name"],
    maxlength: 50,
    minlength: 3,
  },
  username: {
    type: String,
    required: [true, "Please provide username"],
    unique: [true, "That username already exists"],
    maxlength: 50,
    minlength: 3,
  },
  email: {
    type: String,
    required: [true, "Please provide email"],
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      "Please provide a valid email",
    ],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Please provide password"],
    minlength: 6,
  },
  yearsOfExperience: {
    type: Number,
  },
  listOfJoinedGames: {
    type: [String],
  },
  dateOfBirth: {
    type: Date,
  },
  address: {
    houseAptNum: String,
    street: String,
    city: String,
    state: String,
    zipCode: String,
  },
  profileImage: {
    type: String, // You can store the image URL or binary data, depending on your needs.
  },
  phoneNumber: {
    type: String, // You can specify a format or validation rules for phone numbers.
  },
});

module.exports = mongoose.model("User", UserSchema);
