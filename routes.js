require('dotenv').config();

const express = require('express');
const exerciseModel = require('./DB/Schemas/exerciseModel');
const bodyParser = require('body-parser');
const router = express.Router();
const cors = require('cors');
const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');


router.use(cors({ optionsSuccessStatus: 200 }));  // some legacy browsers choke on 204
// router.use('/public', express.static(`${process.cwd()}/public`));
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
router.use(express.static('public'))

if (process.env.ENV === 'PROD') {
    console.log = function() {}
}

router.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// ************************************************************************************************************************************************************

// CREATE NEW USER

router.post('/api/users', async (req, res) => {
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


// ************************************************************************************************************************************************************

function filterLogsByDate(document, fromDate, toDate) {
    return document.log.filter(log => {
        const logDate = new Date(log.date);
        return logDate >= fromDate && logDate <= toDate;
    });
}


// GET LOGS FOR USER
router.get('/api/users/:_id/logs', async (req, res) => {
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
            date: item.date
        }));

        res.json({
            username: exist_url.user,
            count: filteredExercise.length,
            _id: exist_url._id,
            log: logs
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ 'HTTP/500': 'Internal Server Error' });
    }
});




    /*
    // Check for Valid ObjectId for Mongoose
    if (!mongoose.Types.ObjectId.isValid(req.params._id)) {
        return res.json({"HTTP/400": `Invalid ID: ${req.params._id}`})
    }

    let id = new mongoose.Types.ObjectId(req.params._id)
    let from = req.query.from 
    let to = req.query.to
    let limit = Number(req.query.limit) || 50


    let current_date = new Date()
    let humandate;

    if (!from && !to) {
        from = new Date('1900')
        to = current_date
        console.log('DateFields "FROM/TO Empty. Using Default.')

    }
    else if (!from && to) {
        from = new Date('1900')
        to = new Date(to)
        console.log('DateField "FROM" Empty. Using Default.')
    }
    else if (from && !to) {
        from = new Date(from)
        to = current_date
        console.log('DateField "TO" Empty. Using Default.')
    }
    
    try{
        console.log(id, 'From= ', from.toDateString(), '-->', 'To= ', to.toDateString(), "Limit= ", limit)

        // exist_url = await exerciseModel.findOne({"_id": id}, { "log._id": 0 }).select('-__v').sort({ "date": 1 })
    }
    catch(err){
        return res.json({"HTTP/400": `No Logs for ${id} found in database.`})
    }

});
*/





// ************************************************************************************************************************************************************

// POST NEW EXERCISE

router.post('/api/users/:_id/exercises', async (req, res) => {
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

// ************************************************************************************************************************************************************

// DELETE USER

router.delete('/api/users/:_id/delete', async (req, res) => {

    try {
        const exist_url = await exerciseModel.findOne({"_id": id})
        res.json({"HTTP/200": `Deleteion Successful for ${_id}`});
    }
    catch(err) {
        res.json({"HTTP/400": `No username with ${_id} found.`});
    }
});



module.exports = router;