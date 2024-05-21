// routes/authRoutes.js
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../../Users-Service/Model/User');
const router = express.Router();
require('dotenv').config();

const secretKey = process.env.SECRET_KEY;

// Function to generate token
function generateToken(user) {
    return jwt.sign({ userId: user._id, name: user.name }, secretKey, { expiresIn: '15s' });
}

router.get('/getUsername', (req, res) => {
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1]; // Extract token from headers
    if (!token) {
        return res.status(401).json({ message: 'Token not provided' });
    }

    try {
        const decodedToken = jwt.decode(token);
        const name = decodedToken.name;
        res.json({ name });
    } catch (error) {
        console.error('Error decoding token:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Registration route
router.post('/register', async (req, res) => {
    try {
        const { name, surname, email, password, birthdate, gender, height, weight } = req.body;
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ message: 'Email is already registered' });
        }
        if (!password || password.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters long' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            name,
            surname,
            email,
            password: hashedPassword,
            birthdate,
            gender,
            height,
            weight
        });
        await user.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


// Login route
router.post('/login', async (req, res) => {
    try {
        const { name, password } = req.body;
        const user = await User.findOne({ name });
        if (!user) {
            return res.status(401).send({ message: 'Invalid username/password' });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).send({ message: 'Invalid username/password' });
        }
        const token = generateToken(user);
        res.send({ token });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).send({ message: 'Internal Server Error' });
    }
});

// Token verification route
router.get('/verify-token', (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, secretKey);
        res.json({ valid: true });
    } catch (error) {
        res.json({ valid: false });
    }
});

// Token refresh route
router.post('/refresh-token', async (req, res) => {
    const refreshToken = req.body.token;
    if (!refreshToken) {
        return res.status(401).json({ error: 'No refresh token provided' });
    }
    const decoded = jwt.decode(refreshToken);
    const { userId, name } = decoded;
    const newToken = jwt.sign({ userId, name }, secretKey, { expiresIn: '1h' });
    res.json({ newToken });
});

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
  };

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
  
  
  router.get('/:id', getUser, (req, res) => {
    res.json(res.user);
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

module.exports = router;
