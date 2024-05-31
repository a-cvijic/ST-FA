const express = require('express');
const connectDB = require('./config/config');

const app = express();

<<<<<<< HEAD
connectDB();
=======
mongoose.connect(process.env.MONGO_URI_USERS);
const db = mongoose.connection;
>>>>>>> origin/main

app.use(express.json());
<<<<<<< HEAD

const userRoutes = require('./routes/UsersRoutes');
app.use('/users', userRoutes);

const authRoutes = require('./middleware/autentification');
app.use('/auth', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
=======
app.use(cors());
app.use('/auth', authRoutes);
app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
});
>>>>>>> origin/main
