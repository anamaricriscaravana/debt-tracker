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

router.delete('/:id', async (req, res) => {
    try {
        const deletedDebt = await Debt.findByIdAndDelete(req.params.id);
        if (!deletedDebt) {
            return res.status(404).json({ message: 'Debt not found' });
        }
        res.json({ message: 'Debt deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.patch('/:id/status', async (req, res) => {
    try {
        const { status, amountPaid, paymentMethod, datePaid } = req.body;
        const updatedDebt = await Debt.findByIdAndUpdate(
            req.params.id,
            {
                status,
                amountPaid,
                paymentMethod,
                datePaid
            },
            { new: true }
        );

        res.json(updatedDebt);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;