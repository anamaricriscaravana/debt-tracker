const express = require('express');
const router = express.Router();
const Debt = require('../models/Debt');

// POST /api/debts/add - Add a new debt
router.post('/add', async (req, res) => {
    try {
        const newDebt = new Debt(req.body);
        const savedDebt = await newDebt.save();
        res.status(201).json(savedDebt);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/debts - Get all debts
router.get('/all', async (req, res) => {
    try {
        const debts = await Debt.find();
        res.json(debts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;