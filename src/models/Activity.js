const mongoose = require("mongoose");

const ActivitySchema = new mongoose.Schema({
  sportType: {
    type: String,
    default: 'pickleball',
    required: [true, "Please provide the type of sport or activity"],
  },
  location: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    zipCode: { type: Number, required: true },
    state: { type: String, required: true }
  },
  locationType: {
    type: String,
    enum: ['indoor', 'outdoor', 'online'],
    default: 'outdoor',
  },
  date: {
    type: Date,
    required: [true, "Please provide the date of the activity"],
  },
  time: {
    type: String,
    required: [true, "Please provide exact time of the activity"],
  },
  listOfPlayers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  numberOfPlayers: {
    type: Number,
    default: 0,
  },
  maxNumOfPlayers: {
    type: Number,
  },
  minNumOfPlayers: {
    type: Number,
  },
  hostName: {
    type: String,
  },
  hostEmail: {
    type: String,
  },
  hostPhoneNumber: {
    type: String,
  },
  notes: {
    type: String,
  },
  createdBy: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please provide user'],
  },
},
  { timestamps: true });

module.exports = mongoose.model("Activity", ActivitySchema);
