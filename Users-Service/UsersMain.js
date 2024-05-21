const express = require('express');
const connectDB = require('./config/config');

const app = express();

connectDB();

app.use(express.json());

const userRoutes = require('./routes/UsersRoutes');
app.use('/users', userRoutes);

const authRoutes = require('./middleware/autentification');
app.use('/auth', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
