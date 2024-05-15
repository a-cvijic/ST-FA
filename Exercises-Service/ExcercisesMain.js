const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const exerciseRoutes = require('./routes/excercises');
require('dotenv').config();

const app = express();
const PORT = 3000;

mongoose.connect(process.env.MONGO_URI_EXERCISES, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'Connection error:'));
db.once('open', () => {
  console.log('Connected to database');
});

app.use(express.json());
app.use(cors());
app.use('/exercises', exerciseRoutes);
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
