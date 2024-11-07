const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
// const shortid = require('shortid');
const crypto = require("crypto");

require('dotenv').config();

app.use(cors());
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


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
});

let User = mongoose.model('User', userSchema);

let Exercise = mongoose.model('Exercise', exerciseSchema);

  app.post('/api/users', (req, res) => {
    let User1 = new User({
      username: req.body.username
    });
    User1.save()
    res.json(User1)
  });


  app.use(cors())
  app.use(express.static('public'))
  app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html')
  });



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
