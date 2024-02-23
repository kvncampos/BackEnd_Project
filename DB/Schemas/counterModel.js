require('dotenv').config();
const mongoose = require('mongoose');

const Counter = mongoose.model('Counter', { count: Number }, collection='counters');

module.exports = Counter;

