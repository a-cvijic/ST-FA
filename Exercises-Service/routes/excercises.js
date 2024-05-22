const express = require('express');
const Exercise = require('../Model/Exercise');
const ExerciseUser = require('../Model/ExerciseUser');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const secretKey = process.env.SECRET_KEY;


const router = express.Router();

//vmesna funkcija, ki preverja veljavnost tokena
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
    const exercise = new Exercise(req.body);
    await exercise.save();
    res.send(exercise);
  } catch (error) {
    res.send(error);
  }
});

router.post('/excercise', authenticateToken, async (req, res) => {
  try {
      const { name, userId } = req.body;
      
      // Check if the exercise already exists for this user
      const existingExercise = await ExerciseUser.findOne({ name, userId });
      
      if (existingExercise) {
          return res.status(400).send({ message: 'Vaja je že dodana med všečkane vaje' });
      }
      
      const exercise = new ExerciseUser(req.body);
      await exercise.save();
      res.send(exercise);
  } catch (error) {
      res.status(500).send(error);
  }
});



router.get('/exercise/:name', authenticateToken, async (req, res) => {
  try {
      const userName = req.params.name; // Extract the user name from the request parameters
      console.log(userName);
      const exercises = await ExerciseUser.find({ userId: userName });
      res.send(exercises);
  } catch (error) {
      res.status(500).send({ message: "Internal Server Error" });
  }
});

router.get('/exercise', authenticateToken, async (req, res) => {
  try {
    const exercises = await ExerciseUser.find();
    res.send(exercises);
  } catch (error) {
    res.send(error);
  }
});


router.get('/', authenticateToken, async (req, res) => {
  try {
    const exercises = await Exercise.find();
    res.send(exercises);
  } catch (error) {
    res.send(error);
  }
});



router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id);
    if (!exercise) {
      return res.send({ message: 'Exercise not found' });
    }
    res.send(exercise);
  } catch (error) {
    res.send(error);
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const exercise = await Exercise.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!exercise) {
      return res.send({ message: 'Exercise not found' });
    }
    res.send(exercise);
  } catch (error) {
    res.send(error);
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const exercise = await Exercise.findByIdAndDelete(req.params.id);
    if (!exercise) {
      return res.send({ message: 'Exercise not found' });
    }
    res.send(exercise);
  } catch (error) {
    res.send(error);
  }
});

router.delete('/exercise/:id', authenticateToken, async (req, res) => {
  try {
    const exercise = await ExerciseUser.findByIdAndDelete(req.params.id);
    if (!exercise) {
      return res.send({ message: 'Exercise not found' });
    }
    res.send(exercise);
  } catch (error) {
    res.send(error);
  }
});

module.exports = router;
