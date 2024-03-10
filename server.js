require('dotenv').config()
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser');
const db = require('./DB/db');
const exerciseModel = require('./DB/Schemas/exerciseModel');
const shortUrlModel = require('./DB/Schemas/shortUrl');
const dns = require('dns');
const Counter = require('./DB/Schemas/counterModel')
const { ObjectId } = require('mongodb');
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const app = express()
app.use(cors())
app.use(express.static('public'))
app.use(cors({ optionsSuccessStatus: 200 }));  // some legacy browsers choke on 204
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


// ************************* MICROSERVICES LANDING PAGES *************************
// /Timestamp HTML router

app.get("/timestamp", (req, res) => {
  res.sendFile(__dirname + '/views/timestamp.html');
});

//Request Header parser router

app.get("/requestHeaderParser", (req, res) => {
  res.sendFile(__dirname + '/views/requestHeaderParser.html');
});

//URL Shortner

app.get("/urlShortenerMicroservice", (req, res) => {
  res.sendFile(__dirname + '/views/urlShortener_View.html');
});


//Exercise Tracker
app.get("/exerciseTrackerMicroservice", (req, res) => {
res.sendFile(__dirname + '/views/exerciseTracker.html');
});


//File Metadata Microservice
app.get("/fileMetadataMicroservice", (req, res) => {
res.sendFile(__dirname + '/views/fileMetadataMicroservice.html');
});



// ********************************* ROUTES: REQUEST HEADER MICROSERVICE *********************************
app.get("/requestHeaderParser/api/whoami", (req, res) => {
  var ip = req.header("x-forwarded-for") || req.connection.remoteAddress;

  res.json({
      ipaddress: ip,
      software: req.header("user-agent"),
      language: req.header("accept-language")
  });
});

// ********************************* ROUTES: TIMESTAMP MICROSERVICE *********************************
// TimeStamp API Endpoint CurrentTime
app.get("/timestamp/api/", (req, res) => {
  let currentTime = new Date();
  let utc = currentTime.toUTCString();
  let unix = currentTime.getTime();
  console.log('utc: ', utc, 'unix: ', unix)
  res.json({ utc, unix });
});

// TimeStamp API Endpoint ParamTime
app.get("/timestamp/api/:date", (req, res) => {
  let inputDate = req.params.date;

  let date;
  if (!isNaN(inputDate)) {
    date = new Date(parseInt(inputDate));
  } else {
    date = new Date(inputDate);
  }

  if (isNaN(date.getTime())) {
    return res.status(400).json({ error: "Invalid date" });
  }

  let utc = date.toUTCString();
  let unix = date.getTime();
  console.log(req.path, 'utc: ', utc, 'unix: ', unix)
  res.json({ utc, unix });
});

// ********************************* ROUTES: FILE METADATA MICROSERVICE *********************************
app.post("/fileMetadataMicroservice/api/fileanalyse", upload.single("upfile"), uploadFiles);

function uploadFiles(req, res) {
  console.log(req.body);
  console.log(req.file);
  if (!req.file || !req.file.path) {
    return res.json({
      error: 'Missing required parameter: file',
      code: 400,
    })
  }

  data = {
      'name': req.file.originalname,
      'type': req.file.mimetype,
      'size': req.file.size

  }
  res.json(data);
}
// *********************************** FILE METADATA MICROSERVICE UPLOAD CLEANUP ***********************************
const fs = require('fs');
const path = require('path');

const uploadFolder = path.join(__dirname, 'uploads');

// Function to delete the upload folder and recreate it
function deleteAndRecreateUploadFolder() {
    
    fs.rmdir(uploadFolder, { recursive: true }, (err) => {
        if (err) {
            console.error(`Error deleting upload folder: ${err}`);
        } else {
            console.log(new Date().toString());
            console.log(`Upload folder deleted successfully`);
            fs.mkdir(uploadFolder, (err) => {
                if (err) {
                    console.error(`Error creating upload folder: ${err}`);
                } else {
                    console.log('Upload folder recreated successfully!');
                }
            });
        }
    });
}




// *********************************** ROUTES: EXERCISE TRACKER MICROSERVICE ***********************************
// --------------------- POST: CREATE NEW USER ---------------------

app.post('/exerciseTrackerMicroservice/api/users', async (req, res) => {
  const user = req.body.username;
  const userExerciseModel = new exerciseModel({
      "username": user,
  });
  let id = userExerciseModel.id
  let count = userExerciseModel.count

  await userExerciseModel.save();
  res.json({
      "username": user,
      "_id": userExerciseModel.id,
  })
  console.log("HTTP/201: User Created Successfully.")
  console.log({user},{id})
});


// --------------------- GET: ALL USERS ---------------------
app.get('/exerciseTrackerMicroservice/api/users', async (req, res) => {
  try {
      let users = await exerciseModel.find({}, { _id: 1, username: 1 })

      return res.json(users)
  }
  catch(err) {
      res.status(500).json({error: "Internal Error"})
  }
});


// --------------------- GET: LOGS FOR USER ---------------------
app.get('/exerciseTrackerMicroservice/api/users/:_id/logs', async (req, res) => {
  try {
      const { _id } = req.params;
      const { from, to, limit } = req.query;

      let exist_url = await exerciseModel.findById(_id);
      
      let filteredExercise = exist_url.log;

      if (from) {
          filteredExercise = filteredExercise.filter(e => new Date(e.date).getTime() > new Date(from).getTime());
      }
      if (to) {
          filteredExercise = filteredExercise.filter(e => new Date(e.date).getTime() < new Date(to).getTime());
      }
      
      if (parseInt(limit) > 0) {
          filteredExercise = filteredExercise.slice(0, parseInt(limit));
      }

      let logs = filteredExercise.map(item => ({
          description: item.description,
          duration: item.duration,
          date: item.date.toDateString()
      }));

      res.json({
          _id: exist_url._id,
          username: exist_url.user,
          count: filteredExercise.length,
          log: logs
      });

  } catch (error) {
      console.error(error);
      res.status(500).json({ 'HTTP/500': 'Internal Server Error' });
  }
});



// --------------------- POST: NEW EXERCISE ---------------------

app.post('/exerciseTrackerMicroservice/api/users/:_id/exercises', async (req, res) => {
  let uid = req.params._id
  let description = req.body.description
  let duration = Number(req.body.duration)

  let formatted_date;
  let humandate;
  let date;

  if (!req.body.date) {
      date = new Date()
      humandate = date.toDateString()
      console.log(`Date Field is Empty. Defaulting to Current Time. ${humandate}`)
  }
  else {
      formatted_date = req.body.date.split("-")
      const year = formatted_date[0] || new Date().getFullYear()
      const month = formatted_date[1] - 1 || 0
      const day = formatted_date[2] || 1

      date = new Date(year, month, day)
      humandate = date.toDateString()
  }

  temp_date = date

  try {
      const exist_url = await exerciseModel.findOne({"_id": uid}).select('-__v');
      let username;
      
      if (!exist_url) {
          console.log("Error: _id not Found/No Matching Username.");
          return res.json({"HTTP/404": "_id not Found/No Matching Username."});
      } 
      else {
          username = exist_url.username;
          const count = await exerciseModel.findOneAndUpdate({"_id": uid}, {$inc:{count:1}});
          let logAdd = await exerciseModel.updateOne(
              {"_id": uid},
              { $push: {"log": {
                  "description": description,
                  "duration": duration,
                  "date": humandate,
              }}}
          );
          console.log("Data appended to log field:", logAdd);
      }

      res.json({
          "_id": uid,
          username, 
          "date": humandate,
          duration,
          description
      })

      
      console.log({uid, description, duration, temp_date})

  }
  catch (err) {
      console.error("Error occurred while appending data to log field:", error);
      return res.status(500).json({"Error": "Internal Server Error"});
  }
});

// --------------------- DELETE: USER ---------------------

app.delete('/exerciseTrackerMicroservice/api/users/:_id/delete', async (req, res) => {

  try {
      const exist_url = await exerciseModel.findOne({"_id": id})
      res.json({"HTTP/200": `Deleteion Successful for ${_id}`});
  }
  catch(err) {
      res.json({"HTTP/400": `No username with ${_id} found.`});
  }
});


// *********************************** ROUTES: URL SHORTENER ***********************************

// Get All DB Data
app.get('/api/shorturl/all', async (req, res) => {
  try {
    const data = await shortUrlModel.find().select({ original_url: 1, short_url: 1 , _id: 0});
    if (data && data.length > 0) {
      console.log(data);
      res.send(data);
    } else {
      console.error(404);
      res.status(404).json({ "Code 404": 'Database is Empty.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

// ----------------------------------------------------------------------------------------------------------------------------------
app.post('/api/shorturl', async (req, res) => {
  //Post url from user input
  const url = req.body.url;
  try {
      const parsedUrl = new URL(url);
      let something = dns.lookup(parsedUrl.hostname, async (err, address, family) => {
          console.log({
            "URL": `${url}`,
            "IP": address
          })
          if (!address) {
              console.error({'HTTP/400': `Invalid URL: ${parsedUrl}`});
              // return res.status(400).json({ error: 'Invalid URL' });
              res.json({ error: 'Invalid URL' });
          } else {

              console.log({'HTTP/200': `Valid Url Request ${url}`});

              // Check if document with the given original_url exists
              const exist_url = await shortUrlModel.findOne({"original_url": url});
              if (exist_url === null || exist_url.length === 0) {

                  // No documents with the given original_url found, continue
                  console.log({
                      'HTTP/201': `Valid Url Request ${url}`,
                      'Info': 'No Documents with That URL in Database, Created New Document Entry!'
                  });

                  // Create short URL and save it to database
                  try {
                      const counter = await Counter.findOneAndUpdate({}, { $inc: { count: 1 } }, { new: true, upsert: true });
                      const shortUrlValue = counter.count || 1;
                      const shortUrl = new shortUrlModel({
                          "original_url": url,
                          "short_url": shortUrlValue,
                      });
                      await shortUrl.save();
                      return res.status(200).json({
                        "original_url": url, 
                        "short_url": shortUrlValue
                      });
                  } catch (error) {
                      console.error(error);
                      return res.status(500).send(error);
                  }
              } else {
                  // Documents with the given original_url found
                  console.log('Documents found with original_url:', url);
                  return res.status(200).json({
                      "HTTP/200": 'Email already in Database.',
                      "Message": 'Please Try Another URL or Delete Record',
                  }).end();
              }
          }
      });
  } catch (error) {
    console.error({'HTTP/400': `Invalid URL ${url}`});
    // return res.status(400).json({ error: 'Invalid URL' })
    res.json({ error: 'Invalid URL' })

  }
});


// ----------------------------------------------------------------------------------------------------------------------------------
// Get all users
app.get('/urlShortenerMicroservice/api/shorturl/:code', async (req, res) => {
  let id = req.params['code'] 
  try {
    const exist_url = await shortUrlModel.findOne({"short_url": id});
    if (exist_url === null || exist_url.length === 0) {
      res.json({'HTTP/400': "No ShortCodes Exist."});
    }
    else {
      console.log({"HTTP/301": `Redirecting to ${exist_url.original_url}`})
      res.redirect(exist_url.original_url)
    }
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  };
});

// Update a user
app.put('/api/shorturl/:shortcode', async (req, res) => {
  const { shortcode } = req.params;
  const { short_url } = req.body;

  try {
    const user = await shortUrlModel.findByIdAndUpdate(shortcode, { short_url }, { new: true });
    res.send(user);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

// Delete a user
app.delete('/api/shorturl/:shortcode', async (req, res) => {
  const { url } = req.params;

  try {
    const user = await shortUrlModel.findByIdAndDelete(url);
    res.send(user);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});



app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use((err, req, res, next) => {
  res.locals.error = err;
  const status = err.status || 500;
  res.status(status);
  res.render('error');
});



// *********************************** MICROSERVICES DB CLEANUP ***********************************
// Function to delete all documents from the collection
async function deleteexerciseModel() {
  try {
    await exerciseModel.deleteMany({});
    console.log('Success: Deleted all documents from the exerciseModel collection.');
  } catch (error) {
    console.error('Error: Failed to delete documents from the exerciseModel collection.');
    console.error(error);
  }
}


// Function to delete all documents from the collection
async function deleteCounter() {
  try {
    await Counter.deleteMany({});
    console.log('Success: Deleted all documents from the Counter collection.');
  } catch (error) {
    console.error('Error: Failed to delete documents from the Counter collection.');
    console.error(error);
  }
}

// Function to delete all documents from the collection
async function delecteshortUrlModel() {
  try {
    await shortUrlModel.deleteMany({});
    console.log('Success: Deleted all documents from the shortUrlModel collection.');
  } catch (error) {
    console.error('Error: Failed to delete documents from the shortUrlModel collection.');
    console.error(error);
  }
}

// Call deleteCounter every 5 minutes
setInterval(deleteCounter, 300000); // 2 minutes = 120000 milliseconds

// Call delecteshortUrlModel every 5 minutes
setInterval(delecteshortUrlModel, 300000); // 2 minutes = 120000 milliseconds

// Call deleteAllDocuments every 2 minutes
setInterval(deleteexerciseModel, 120000); // 2 minutes = 120000 milliseconds

// *********************************** UTILITIES FOR SERVER ***********************************
var morgan = require('morgan')

/* 
  Change to 'dev' : Concise output colored by response status for development us
  Change to 'tiny' : The minimal output.
  https://github.com/expressjs/morgan
*/
app.use(morgan(process.env.ENVIRONMENT))


// Schedule deletion and recreation every 60 seconds
setInterval(deleteAndRecreateUploadFolder, 60000); // 60 seconds = 60,000 milliseconds


// *********************************** APP SETUP ***********************************
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})

// app.use((req, res, next) => {
  // const err = new Error('Not Found');
  // err.status = 404;
  // next(err);
// });

// app.use((err, req, res, next) => {
  // res.locals.error = err;
  // const status = err.status || 500;
  // res.status(status);
  // res.render('error');
// });