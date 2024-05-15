const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../Users-Service/Model/User');
require('dotenv').config();
const cors = require('cors');

const app = express();
const PORT = 3010;
const secretKey = process.env.SECRET_KEY;
app.use(cors());

mongoose.connect(process.env.MONGO_URI_USERS, { useNewUrlParser: true, useUnifiedTopology: true });// Povezava na mongodb
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'Napaka pri povezavi:'));
db.once('open', () => {
  console.log('Povezava z bazo vzpostavljena');
});
app.use(express.json());

//funkcija za generiranje tokena
function generateToken(user) {
    return jwt.sign({ userId: user._id, username: user.username }, secretKey, { expiresIn: '15m' });
  }

//Registracija uporabnika
app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
    if (!password || password.length < 8) {
      return res.json({ message: 'Geslo mora vsebovati vsaj 8 znakov' });
    }
      const hashedPassword = await bcrypt.hash(req.body.password, 10); 
      const user = new User({
        username: req.body.username,
        password: hashedPassword 
      });
      await user.save();
      res.send(user);
    } catch (error) {
      res.send(error);
    }
  });

// Avtentikacija uporabnika
app.post('/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await User.findOne({ username });
      if (!user) {
        return res.send({ message: 'Nepravilen uporabnik/geslo' });
      }
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.send({ message: 'Nepravilen uporabnik/geslo' });
      }
      const token = generateToken(user);
      res.send({ token });
    } catch (error) {
      console.error('Nepravilen uporabnik/geslo', error);
      res.send({ message: 'Nepravilen uporabnik/geslo' });
    }
  });

  //za preverjanje tokena
app.get('/verify-token', (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Ni tokena' });
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    res.json({ valid: true });
  } catch (error) {
    res.json({ valid: false });
  }
});

// Za refreshanje tokena
app.post('/refresh-token', (req, res) => {
  const refreshToken = req.body.token;
  if (!refreshToken) {
    return res.status(401).json({ error: 'Ni refresh tokena' });
  }
  const newToken = jwt.sign({}, secretKey, { expiresIn: '1h' });
  res.json({ newToken });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });