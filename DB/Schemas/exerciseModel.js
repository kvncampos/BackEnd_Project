require('dotenv').config();
const mongoose = require('mongoose');

const exerciseTrackerSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  count: {
    type: Number,
    default: 0,
  },
  log:[{
    description : String,
    duration : Number,
    date : Date,
  }]
});

const exerciseModel = mongoose.model('exerciseModel', exerciseTrackerSchema, collection='exerciseTracker');

module.exports = exerciseModel;