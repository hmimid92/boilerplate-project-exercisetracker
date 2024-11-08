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
	description: { type: String},
	duration: { type: Number },
	date: String,
  _id: String
  });

const userSchema = new mongoose.Schema({
	username: { type: String, required: true },
  });

let User = mongoose.model('User', userSchema);

let Exercise = mongoose.model('Exercise', exerciseSchema);

  app.post('/api/users', async (req, res) => {
    try {
      let User1 = new User({
        username: req.body.username
      });
        await User1.save()
        res.json(User1)
    } catch (er) {
       res.json({error: er})
    }
  });

  let logs = {};
  app.post('/api/users/:_id/exercises', async (req, res) => {
    const user_name = await User.findById(req.params._id);
    // console.log(user_name._id.toString())
      if(!Object.keys(logs).includes(req.params._id)) {
        const Exercice1 = new Exercise({
          username: user_name.username,
          description: req.body.description,
          duration: parseInt(req.body.duration),
          date: req.body.date === "" ? (new Date(Date.now())).toDateString() : (new Date(req.body.date)).toDateString(),
          _id: req.params._id
        });
        logs = {
          [req.params._id]: {
            _id: req.params._id,
            username: user_name.username,
            count: 1,
            log: [{
              description: req.body.description,
              duration: parseInt(req.body.duration),
              date: req.body.date === "" ? (new Date(Date.now())).toDateString() : (new Date(req.body.date)).toDateString(),
            }]
          }      
        }   
          await Exercice1.save()
          res.json(Exercice1)
      } else {

        const obj_new = Exercise.findOneAndUpdate({_id: req.params._id},
          {description: req.body.description,
          duration: parseInt(req.body.duration),
          date: req.body.date === "" ? (new Date(Date.now())).toDateString() : (new Date(req.body.date)).toDateString()},{new: true}
        )
        const Exercice1_update = new Exercise({
          username: user_name.username,
          description: obj_new.description,
          duration: obj_new.duration,
          date: obj_new.date,
          _id: req.params._id
        });
        logs[req.params._id] = {
          ...logs[req.params._id],
          count: logs[req.params._id].count + 1,
          log: [...logs[req.params._id].log,{
            description: obj_new.description,
            duration: obj_new.duration,
            date: obj_new.date,
          }]
         }    
         await Exercice1_update.save()
         res.json(Exercice1_update)
      }  
  });

  app.get('/api/users/:_id/logs',  async (req, res) => {
       res.json(logs[req.params._id])
   });

  app.get('/api/users',  async (req, res) => {
    try {
       const result = await User.find({});
       res.json(result)
    } catch(err) {
       console.log(err);
    }
   });

  app.use(cors())
  app.use(express.static('public'))
  app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html')
  });



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
