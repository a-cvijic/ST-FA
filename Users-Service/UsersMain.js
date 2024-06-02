const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/users');
require('dotenv').config();

const app = express();
const PORT = 3010;

mongoose.connect(process.env.MONGO_URI_USERS);
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'Connection error:'));
db.once('open', () => {
    console.log('Connected to database');
});
app.use(express.json());
app.use(cors());
app.use('/auth', authRoutes);
app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
});