const mongoose = require("mongoose");

const ActivitySchema = new mongoose.Schema({
  sportType: {
    type: String,
    required: [true, "Please provide the type of sport or activity"],
  },
  description: {
    type: String,
  },
  date: {
    type: Date,
    required: [true, "Please provide the date of the activity"],
  },
  time: {
    type: String,
  },
  location: {
    placeNum: String,
    street: String,
    city: String,
    state: String,
    zipCode: String,
  },
  listOfPlayers: {
    type: [String],
  },
  numberOfPlayers: {
    type: Number,
    default: 0,
  },
  maxNumOfPlayer: {
    type: Number,
  },
  minNumOfPlayers: {
    type: Number,
  },
  fees: {
    type: String,
  },
  indoorOutdoor: {
    type: String,
  },
  anticipatedWeather: {
    type: String,
  },
  anticipatedTemp: {
    type: Number,
  },
  organizerName: {
    type: String,
  },
  organizerNum: {
    type: String,
  },
  notes: {
    type: String,
  },
});

module.exports = mongoose.model("Activity", ActivitySchema);
