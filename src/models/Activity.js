const mongoose = require('mongoose');
const { getCoordinatesFromZipCode } = require('../utils/geocoding');


const ActivitySchema = new mongoose.Schema({
  activityType: {
    type: String,
    default: 'pickleball',
    required: [true, 'Sport type is required.'],
  },
  date: {
    type: Date,  //YYYY/MM/DD
    required: [true, 'Date of the activity is required in form of YYYY/MM/DD.'],
  },
  time: {
    type: String,
    required: [true, 'Time of the activity is required.'],
  },
  location: {
    address: {
      type: String,
      required: [true, 'Please, enter street number and name'],
    },
    townOrCity: {
      type: String,
      required: [true, 'Town/City is required.'],
    },
    state: {
      type: String,
      required: [true, 'State is required.'],
    },
    zipCode: {
      type: String,
      required: [true, 'Zip Code is required.'],
    },
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        required: true,
      }
    }
  },
  venue: {
    type: String,
    enum: ['indoor', 'outdoor', 'online'],
  },
  players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  maxPlayers: { type: Number, default: 10 },
  minPlayers: { type: Number, default: 2 },
  experienceLevel: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  contactName: String,
  contactNum: String,
  contactEmail: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    match: [
      /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/,
      'Please provide a valid email address',
    ],
  },
  fees: {
    type: Number,
    default: 0,
  },
  notes: String,
});

ActivitySchema.pre('save', async function (next) {
  try {
    // Calculate coordinates based on address information
    const coordinates = await getCoordinatesFromZipCode(
      `${this.location.address}, ${this.location.townOrCity}, ${this.location.state}, ${this.location.zipCode}`
    );

    // Set the calculated coordinates
    this.location.coordinates = {
      type: 'Point',
      coordinates: [coordinates.lng, coordinates.lat],
    };

    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Activity', ActivitySchema);
