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
    city: {
      type: String,
      required: [true, 'City is required.'],
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
    },
  },
  venue: {
    type: String,
    enum: ['indoor', 'outdoor', 'online'],
    required: [true, 'Please, enter the venue type.'],
  },
  players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  maxPlayers: {
    type: Number,
    required: [true, 'Please, enter the maximum number of players for activity.'],
    default: 10,
  },
  minPlayers: {
    type: Number,
    required: [true, 'Please, enter the minimum number of players for activity.'],
    default: 2
  },
  experienceLevel: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    required: [true, 'Please, enter the experience level for activity.'],
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  contactName: {
    type: String,
    required: [true, 'Please, enter the name of the person who can be reached for this activity.'],
  },
  contactPhoneNum: {
    type: String,
    required: [true, 'Please, enter the phone number of the person who can be reached for this activity.'],
  },
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
  notes: {
    type: String,
  },
});

ActivitySchema.pre('save', async function (next) {
  try {
    const coordinates = await getCoordinatesFromZipCode(
      `${this.location.address}, ${this.location.city}, ${this.location.state}, ${this.location.zipCode}`
    );

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
