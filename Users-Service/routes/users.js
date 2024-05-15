// routes/authRoutes.js
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../Model/User');
const router = express.Router();
require('dotenv').config();

const secretKey = process.env.SECRET_KEY;

// Function to generate token
function generateToken(user) {
    return jwt.sign({ userId: user._id, username: user.username }, secretKey, { expiresIn: '15m' });
}

// Registration route
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!password || password.length < 8) {
            return res.json({ message: 'Password must be at least 8 characters long' });
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

// Login route
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) {
            return res.send({ message: 'Invalid username/password' });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.send({ message: 'Invalid username/password' });
        }
        const token = generateToken(user);
        res.send({ token });
    } catch (error) {
        console.error('Invalid username/password', error);
        res.send({ message: 'Invalid username/password' });
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
router.post('/refresh-token', (req, res) => {
    const refreshToken = req.body.token;
    if (!refreshToken) {
        return res.status(401).json({ error: 'No refresh token provided' });
    }
    const newToken = jwt.sign({}, secretKey, { expiresIn: '1h' });
    res.json({ newToken });
});

module.exports = router;
