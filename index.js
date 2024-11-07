const express = require('express')
const app = express()
const cors = require('cors')
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
// const shortid = require('shortid');
const crypto = require("crypto");

require('dotenv').config();

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const exerciseSchema = new mongoose.Schema({
	username: String,
	description: { type: String, required: true },
	duration: { type: Number, required: true },
	date: String,
  _id: String,
});

const userSchema = new mongoose.Schema({
	username: { type: String, required: true },
  _id: String
});

let User = mongoose.model('User', userSchema);

let Exercise = mongoose.model('Exercise', exerciseSchema);

  app.post('/api/users', (req, res,next) => {
    let User1 = new User({
      name: "gate",
      age: 42,
      favoriteFoods: ["parsely", "bread"]
    });
    User1.save(function(err,data) {
      if (err) { 
        return next(err)
      } else {
        res.json(data)
      }
    });
  });


  app.use(cors())
  app.use(express.static('public'))
  app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html')
  });



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
