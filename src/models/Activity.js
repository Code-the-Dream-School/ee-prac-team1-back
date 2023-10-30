const mongoose = require("mongoose");

const ActivitySchema = new mongoose.Schema({
  sportType: {
    type: String,
    required: [true, "Sport type is required."],
  },
  description: String,
  date: {
    type: Date,
    required: [true, "Date of the activity is required."],
  },
  time: {
    type: String,
    required: [true, "Time of the activity is required."],
  },
  location: {
    placeNum: String,
    street: {
      type: String,
      required: [true, "Street is required."],
    },
    city: {
      type: String,
      required: [true, "City is required."],
    },
    state: {
      type: String,
      required: [true, "State is required."],
    },
    zipCode: {
      type: String,
      required: [true, "Zip Code is required."],
    },
  },
  indoorOutdoor: {
    type: String,
    enum: ["indoor", "outdoor", "online"],
  },
  players: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  maxPlayers: { type: Number, default: 10 },
  minPlayers: { type: Number, default: 2 },
  weather: String,
  tempF: Number,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  contactName: String,
  contactNum: String,
  fees: {
    type: Number,
    default: 0,
  },
  notes: String,
});

module.exports = mongoose.model("Activity", ActivitySchema);
