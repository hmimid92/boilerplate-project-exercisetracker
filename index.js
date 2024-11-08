const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { Schema } = mongoose;

require('dotenv').config();

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const UserSchema = new Schema({
  username: String,
});
const User = mongoose.model("User", UserSchema);

const ExerciseSchema = new Schema({
  user_id: { type: String, required: true },
  description: String,
  duration: Number,
  date: Date,
});
const Exercise = mongoose.model("Exercise", ExerciseSchema);

app.use(cors())
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find({}).select("_id username");
    res.json(users);
  } catch (error) {
    res.send(error);
  }
})

app.post("/api/users", async (req, res) => {
  const userDb = new User({
    username: req.body.username
  })
  try{
    const user = await userDb.save()
    res.json(user)
  }catch(err){
    res.send(err)
  }
})

app.post("/api/users/:_id/exercises", async (req, res) => {
    const user = await User.findById(req.params._id)
    if (!user){
      res.send("Could not find user")
    } else {
      const exerciseObj = new Exercise({
        user_id: user._id,
        description: req.body.description,
        duration: parseInt(req.body.duration),
        date: req.body.date ? new Date(req.body.date) : new Date(Date.now())
      })
      const exercise = await exerciseObj.save()
      res.json({
        _id: user._id,
        username: user.username,
        description: exercise.description,
        duration: exercise.duration,
        date: new Date(exercise.date).toDateString()
      })
    }
})


app.get("/api/users/:_id/logs", async (req, res) => {

  const user = await User.findById(req.params._id);
  let dateObj = {}
  if (req.query.from) {
    dateObj["$gte"] = new Date(req.query.from)
  }
  if (req.query.to){
    dateObj["$lte"] = new Date(req.query.to)
  }
  let filter = {
    user_id: req.params._id
  }
  if(req.query.from || req.query.to){
    filter.date = dateObj;
  }

  const exercises = await Exercise.find(filter).limit(parseInt(req.query.limit))
  
  const log = exercises.map(e => ({
    description: e.description,
    duration: e.duration,
    date: e.date.toDateString()
  }))

  if(req.query.from === undefined && req.query.from === undefined && req.query.from === undefined) {
    res.json({
      username: user.username,
      count: exercises.length,
      _id: user._id,
      log
    })
  } else {
    res.json({
      username: user.username,
      count: exercises.length,
      _id: user._id,
      form: req.query.from ? (new Date(req.query.from)).toDateString() : (new Date()).toDateString(),
      to: req.query.to ? (new Date(req.query.to)).toDateString() : (new Date()).toDateString(),
      log
    })
  }
    
  
})


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
