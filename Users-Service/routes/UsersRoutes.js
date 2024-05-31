const express = require('express');
const User = require('../Model/User');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authenticateToken = require('../middleware/autentification');

router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

async function getUser(req, res, next) {
  let user;
  try {
    user = await User.findById(req.params.id);
    if (user == null) {
      return res.status(404).json({ message: 'Cannot find user'});
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }

  res.user = user;
  next();
}

router.get('/:id', getUser, (req, res) => {
  res.json(res.user);
});

router.post('/', async (req, res) => {
  const user = new User({
    _id: req.body._id,
    name: req.body.name,
    surname: req.body.surname,
    email: req.body.email,
    password: req.body.password,
    birthdate: req.body.birthdate,
    gender: req.body.gender,
    height: req.body.height,
    weight: req.body.weight
  });

  try {
    const newUser = await user.save();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', getUser, async (req, res) => {
if (req.body.name != null) {
   res.user.name = req.body.name;
   }
try {
const updatedUser = await res.user.save();
res.json(updatedUser);
} catch (err) {
res.status(400).json({ message: err.message });
}
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await User.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).json({ message: 'User not found' });
    }
    console.log(`User ${req.params.id} deleted successfully.`);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error(`Error deleting user: ${err.message}`);
    res.status(500).json({ message: err.message });
  }
});

const JWT_SECRET = 'ST_SECRET';

router.post('/register', async (req, res) => {
  const { _id, name, surname, email, password, birthdate, gender, height, weight } = req.body;

  const user = new User({
    _id,
    name,
    surname,
    email,
    password,
    birthdate,
    gender,
    height,
    weight,
  });

  try {
    const newUser = await user.save();
    const token = jwt.sign({ _id: newUser._id }, JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ token });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Email or password is wrong' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ message: 'Invalid password' });

    const token = jwt.sign({ _id: user._id }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;