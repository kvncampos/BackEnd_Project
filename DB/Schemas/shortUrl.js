require('dotenv').config();
const mongoose = require('mongoose');

const shortUrlSchema = new mongoose.Schema({
  original_url: {
    type: String,
    required: true,
  },
  short_url: {
    type: Number,
    required: true,
    unique: true,
  }
});

const shortUrlModel = mongoose.model('shortUrl', shortUrlSchema, collection='shortUrl');

module.exports = shortUrlModel;