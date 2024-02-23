require('dotenv').config();
const process= require('process');
process.removeAllListeners('warning');

// ------------------------------------------------------
// ** Install and Set Up Mongoose **
const mongoose = require("mongoose");
mongoose
    .connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => {
        console.log('Connected to Mongo!');
    })
    .catch((err) => {
        console.error('Error connecting to Mongo', err);
    });

