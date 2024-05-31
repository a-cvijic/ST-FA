const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const trainingRoutes = require('./routes/trainings');

require('dotenv').config();

const app = express();
const PORT = 3004;

mongoose.connect(process.env.MONGO_URI_TRAININGS, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'Napaka pri povezavi:'));
db.once('open', () => {
  console.log('Povezava na podatkovno bazo vzpostavljena');
});

app.use(express.json());
app.use(cors());
app.use('/trainings', trainingRoutes);
app.listen(PORT, () => {
  console.log(`Strežnik teče na http://localhost:${PORT}`);
});

