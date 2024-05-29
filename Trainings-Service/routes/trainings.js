require('dotenv').config();

const express = require('express');
const Training = require('../Model/Training');
const jwt = require('jsonwebtoken');
const secretKey = process.env.SECRET_KEY;
const router = express.Router();


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


router.get('/', authenticateToken, async (req, res) => {
  try {
    const trainings = await Training.find();
    res.json(trainings);
  } catch (error) {
    console.error('Napaka pri pridobivanju treningov:', error);
    res.status(500).send('Napaka pri pridobivanju treningov');
    next(error);
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


router.post('/', authenticateToken, async (req, res) => {
  try {
    const newTraining = req.body;
    newTraining.favourite = false;
    newTraining.created = new Date();
    newTraining.updated = null;
    newTraining.user_id = req.user.id;
    const createdTraining = await Training.create(newTraining);
    res.status(201).json(createdTraining);
  } catch (error) {
    console.error('Napaka pri ustvarjanju treninga:', error);
    res.status(500).send('Napaka pri ustvarjanju treninga');
    next(error);
  }
});


router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updatedTraining = req.body;
    updatedTraining.updated = new Date();
    const result = await Training.findByIdAndUpdate(id, updatedTraining, { new: true });
    if (result) {
      res.json(result);
    } else {
      res.status(404).send('Trening ni bil najden');
    }
  } catch (error) {
    console.error('Napaka pri posodobitvi treninga:', error);
    res.status(500).send('Napaka pri posodobitvi treninga');
    next(error);
  }
});

router.put('/f/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const training = await Training.findById(req.params.id);
    training.favourite = !training.favourite;
    const result = await Training.findByIdAndUpdate(id, training, { new: true });
    if (result) {
      res.json(result);
    } else {
      res.status(404).send('Trening ni bil najden');
    }
  } catch (error) {
    console.error('Napaka pri dodajanju treninga v priljubljene:', error);
    res.status(500).send('Napaka pri dodajanju treninga v priljubljene');
    next(error);
  }
});


router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Training.findByIdAndDelete(id);
    if (result) {
      res.sendStatus(204);
    } else {
      res.status(404).send('Trening ni bil najden');
    }
  } catch (error) {
    console.error('Napaka pri brisanju treninga:', error);
    res.status(500).send('Napaka pri brisanju treninga');
    next(error);
  }
});


module.exports = router;