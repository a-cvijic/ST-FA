const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/users');
require('dotenv').config();

const app = express();
const PORT = 3010;

mongoose.connect(process.env.MONGO_URI_USERS, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'Connection error:'));
db.once('open', () => {
    console.log('Connected to database');
});
app.use(express.json());
app.use(cors());
app.use('/auth', authRoutes); // Use the authRoutes middleware for /auth/* routes
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
