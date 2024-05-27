const express = require('express');
const Training = require('../Model/Training');
const TrainingUser = require('../Model/TrainingUser');
const jwt = require('jsonwebtoken');

require('dotenv').config();
const secretKey = process.env.SECRET_KEY;


const router = express.Router();

// Preverjanje veljavnosti tokena
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);
  jwt.verify(token, secretKey, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    console.log(req.user);
    next();
  });
  };


router.post('/', authenticateToken, async (req, res) => {
  try {
  const Training = new Training(req.body);
  await Training.save();
  res.send(Training);
  } catch (error) {
  res.send(error);
  }
});

router.post('/training', authenticateToken, async (req, res) => {
  try {
    const { name, userId } = req.body;
    const existingExercise = await TrainingUser.findOne({ name, userId });
    if (existingExercise) {
      return res.status(400).send({ message: 'Trening je že dodan med všečkane treninge' });
    }
    const Training = new TrainingUser(req.body);
    await Training.save();
    res.send(Training);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get('/training/:name', authenticateToken, async (req, res) => {
  try {
    const userName = req.params.name;
    console.log(userName);
    const trainings = await TrainingUser.find({ userId: userName });
    res.send(trainings);
  } catch (error) {
    res.status(500).send({ message: "Napaka na strežniku" });
  }
});

router.get('/training', authenticateToken, async (req, res) => {
  try {
  const trainings = await TrainingUser.find();
  res.send(trainings);
  } catch (error) {
  res.send(error);
  }
});


router.get('/', authenticateToken, async (req, res) => {
  try {
  const trainings = await Training.find();
  res.send(trainings);
  } catch (error) {
  res.send(error);
  }
});



router.get('/:id', authenticateToken, async (req, res) => {
  try {
  const training = await Training.findById(req.params.id);
  if (!training) {
    return res.send({ message: 'Trening ni bil najden' });
  }
  res.send(training);
  } catch (error) {
  res.send(error);
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
  const training = await Training.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!training) {
    return res.send({ message: 'Trening ni bil najden' });
  }
  res.send(training);
  } catch (error) {
  res.send(error);
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
  const training = await Training.findByIdAndDelete(req.params.id);
  if (!training) {
    return res.send({ message: 'Trening ni bil najden' });
  }
  res.send(training);
  } catch (error) {
  res.send(error);
  }
});

router.delete('/training/:id', authenticateToken, async (req, res) => {
  try {
  const training = await TrainingUser.findByIdAndDelete(req.params.id);
  if (!training) {
    return res.send({ message: 'Trening ni bil najden' });
  }
  res.send(training);
  } catch (error) {
  res.send(error);
  }
});

module.exports = router;
