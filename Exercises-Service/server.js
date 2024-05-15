const express = require('express');
const mongoose = require('mongoose');
const Exercise = require('./Model/Exercise');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const path = require('path');
const webpush = require('web-push');
const secretKey = process.env.SECRET_KEY;


const app = express();
const PORT = 3000;


mongoose.connect(process.env.MONGO_URI_EXERCISES, { useNewUrlParser: true, useUnifiedTopology: true });// Povezava na mongodb
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'Napaka pri povezavi:'));
db.once('open', () => {
  console.log('Povezava z bazo vzpostavljena');
});
app.use(express.json());
app.use(cors());
const publicDirectoryPath = path.join(__dirname, '../Odjemalec');
app.use(express.static(publicDirectoryPath));




//vmesna funkcija, ki preverja veljavnost tokena
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);
  jwt.verify(token, secretKey, (err, user) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
  });
}

/*app.post('/login', (req, res) => {
  const user = { id: 1, username: 'example_user' };
  const token = jwt.sign(user, secretKey, { expiresIn: '1h' });//primer, kjer je avtentikacija vedno uspešna
  res.json({ token });
});*/


const publicKey = 'BHlaMKbhm8ltFEIrkiKA6b2ir4e480SVN7ezJkTQle141xKm7Pn0PUJ6nvSB1xn6cf51vhKjLeI2d_YBZJiZjeo';
const privateKey = 'stneoe6WnRGj_5RDELwJwMhQaSj4J9cNOhC-RqPZmvU';

webpush.setVapidDetails(
  'mailto:your-email@example.com',
  publicKey,
  privateKey
);

// Končna točka za pošiljanje potisnih obvestil
app.post("/push-notification", (req, res) => {
  const subscription = req.body;
  res.status(201).json({});
  const payload = JSON.stringify({ title: "vadba uspešno vstavljena" });
  webpush
    .sendNotification(subscription, payload)
    .catch(err => console.error(err));
});

app.post("/fetch-notification", (req, res) => {
  const subscription = req.body;
  res.status(201).json({});
  const payload = JSON.stringify({ title: "Uspešno pridobil vadbe" });
  webpush
    .sendNotification(subscription, payload)
    .catch(err => console.error(err));
});

app.post("/delete-notification", (req, res) => {
  const subscription = req.body;
  res.status(201).json({});
  const payload = JSON.stringify({ title: "Uspešno izbrisal vadbo" });
  webpush
    .sendNotification(subscription, payload)
    .catch(err => console.error(err));
});

app.post("/update-notification", (req, res) => {
  const subscription = req.body;
  res.status(201).json({});
  const payload = JSON.stringify({ title: "Uspešno posodobil vadbo" });
  webpush
    .sendNotification(subscription, payload)
    .catch(err => console.error(err));
});

app.post('/exercises',authenticateToken, async (req, res) => {
  try {
    const exercise = new Exercise(req.body);
    await exercise.save();
    res.send(exercise);
  } catch (error) {
    res.send(error);
  }
});

app.get('/exercises', authenticateToken, async (req, res) => {//kličem to funkcijo za validacijo tokena
  try {
    const exercises = await Exercise.find();
    res.send(exercises);
  } catch (error) {
    res.send(error);
  }
});

app.get('/exercises/:id', authenticateToken, async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id);
    if (!exercise) {
      return res.send({ message: 'Vaja ne obstaja' });
    }
    res.send(exercise);
  } catch (error) {
    res.send(error);
  }
});

app.put('/exercises/:id',authenticateToken, async (req, res) => {
  try {
    const exercise = await Exercise.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!exercise) {
      return res.send({ message: 'Vaja ne obstaja' });
    }
    res.send(exercise);
  } catch (error) {
    res.send(error);
  }
});

app.delete('/exercises/:id',authenticateToken, async (req, res) => {
  try {
    const exercise = await Exercise.findByIdAndDelete(req.params.id);
    if (!exercise) {
      return res.send({ message: 'Vaja ne obstaja' });
    }
    res.send(exercise);
  } catch (error) {
    res.send(error);
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
