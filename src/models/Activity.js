const mongoose = require("mongoose");

const ActivitySchema = new mongoose.Schema({
  activityType: {
    type: String,
    default: "pickleball",
    required: [true, "Sport type is required."],
  },
  description: String,
  date: {
    type: Date,  //YYYY/MM/DD
    required: [true, "Date of the activity is required in form of YYYY/MM/DD."],
  },
  time: {
    type: String,
    required: [true, "Time of the activity is required."],
  },
  location: {
    address: {
      type: String,
      required: [true, "Please, enter street number and name"],
    },
    townOrCity: {
      type: String,
      required: [true, "Town/City is required."],
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
  venue: {
    type: String,
    enum: ["indoor", "outdoor", "online"],
  },
  players: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  maxPlayers: { type: Number, default: 10 },
  minPlayers: { type: Number, default: 2 },
  experienceLevel: {
    type: String,
    enum: ["Beginner", "Intermediate", "Advanced"],
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  contactName: String,
  contactNum: String,
  contactEmail: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    match: [
      /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/,
      "Please provide a valid email address",
    ],
  },
  fees: {
    type: Number,
    default: 0,
  },
  notes: String,
});

module.exports = mongoose.model("Activity", ActivitySchema);
