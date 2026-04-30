const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const authRoutes = require('./routes/authRoutes');
const debtRoutes = require('./routes/debtRoutes');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/debts', debtRoutes);

const uri = process.env.MONGO_URI;

mongoose.connect(uri)
    .then(() => console.log("Connected to MongoDB Atlas!"))
    .catch(err => console.log("Error connecting to MongoDB:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});