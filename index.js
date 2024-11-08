const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

require('dotenv').config();

app.use(cors());
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const exerciseSchema = new mongoose.Schema({
	description: { type: String},
	duration: { type: Number },
	date: String,
  _id: false
  });

let Exercise = mongoose.model('Exercise', exerciseSchema);

const userSchema = new mongoose.Schema({
	username: { type: String, required: true },
  });

let User = mongoose.model('User', userSchema);

const exerciseSchemaUser = new mongoose.Schema({
    username: String,
    count: Number,
    _id: String,
    logUser: [exerciseSchema]
    });

let ExerciseUser = mongoose.model('ExerciseUser', exerciseSchemaUser);




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

  let users = [];
  app.post('/api/users/:_id/exercises', async (req, res) => {
      const user_name = await User.findById(req.params._id);
      const Exercice1 = new Exercise({
        description: req.body.description,
        duration: parseInt(req.body.duration),
        date: req.body.date === "" ? (new Date(Date.now())).toDateString() : (new Date(req.body.date)).toDateString(),
      });
    if(!users.includes(req.params._id)) {
     let Exercise_full = new ExerciseUser({
        username: user_name.username,
        count: 1,
        _id: req.params._id,
        logUser: [Exercice1]
      });
      await Exercise_full.save()
    } else {
      let resu = await ExerciseUser.findById(req.params._id);
      resu.logUser.push(Exercice1)
      ExerciseUser.updateOne({_id: req.params._id}, {logUser: 
        resu.logUser,count: resu.count + 1 }).exec()
    }
    if(!users.includes(req.params._id)) {
      users.push(req.params._id)
    }
    const exercice_fields = Exercice1._doc;
    res.json({_id: req.params._id, username: user_name.username, date: exercice_fields.date, duration: exercice_fields.duration, description: exercice_fields.description })
  });

  app.get('/api/users/:_id/logs',  async (req, res) => {
    try {
      if(req.query.from === undefined && req.query.to === undefined && req.query.limit === undefined) {
        const result = await ExerciseUser.find({_id: req.params._id });
        res.json(result[0])
      } else {
        const result_log = await ExerciseUser.find({_id: req.params._id });
        let count_limit = parseInt(req.query.limit);
        const arr = result_log[0].logUser.filter((el) => Date.parse(el.date) >= Date.parse(new Date(req.query.from)) && Date.parse(el.date) <= Date.parse(new Date(req.query.to))).filter((el,i) => i < count_limit)
        if(count_limit === 0 || count_limit >= arr.length) {
          count_limit = arr.length; 
        }
        res.json({
            _id: req.params._id,
            username: result_log[0].username,
            from: (new Date(req.query.from)).toDateString(),
            to: (new Date(req.query.to)).toDateString(),
            count: count_limit,
            log: arr    
        })
      }
   } catch(err) {
      console.log(err);
   }
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
