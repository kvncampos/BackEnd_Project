require('dotenv').config()
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser');
const db = require('./DB/db');
const router = require('./routes')
const app = express()

app.use(cors())
app.use(express.static('public'))
app.use(cors({ optionsSuccessStatus: 200 }));  // some legacy browsers choke on 204
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/', router)


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})