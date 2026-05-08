const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const authRoutes = require('./routes/authRoutes');
const debtRoutes = require('./routes/debtRoutes');

const app = express();
app.set('trust proxy', 1)
app.use(cors({
    origin: ['https://recollect-frontend-c0c2a0gadkfdcgav.southeastasia-01.azurewebsites.net', 'http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.get('/health', (req, res) => {
    res.status(200).send('Server is healthy and running!');
});
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