const mongoose = require("mongoose");

const ActivitySchema = new mongoose.Schema({
  sportType: {
    type: String,

    required: [true, "Sport type is required."],
  },
  description: String,
  datetime: {
    type: Date,
    required: [true, "Date and time of the activity are required."],
  },
  location: {
    placeNum: String,
    street: String,
    city: String,
    state: String,
    zipCode: String,
  },
  players: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  maxPlayers: Number,
  minPlayers: Number,
  fees: {
    type: Number,
    default: 0,
  },
  indoorOutdoor: {
    type: String,
    enum: ["indoor", "outdoor", "online"],
  },
  anticipatedWeather: String,
  anticipatedTemp: Number,
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  contactName: String,
  contactNum: Number,
  notes: String,
});

module.exports = mongoose.model("Activity", ActivitySchema);
