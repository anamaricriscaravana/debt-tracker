const express = require('express');
const router = express.Router();
const Debt = require('../models/Debt');
const auth = require('../middleware/auth');

// POST /api/debts/add - Add a new debt
router.post('/add', auth, async (req, res) => {
    try {
        console.log("User ID from token:", req.user.id);
        const newDebt = new Debt({
            ...req.body,
            status: 'Unpaid',
            user: req.user.id
        });

        const debt = await newDebt.save();
        res.json(debt);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// GET /api/debts - Get all debts
router.get('/all', auth, async (req, res) => {
    try {
        const debts = await Debt.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(debts);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.delete('/:id', auth, async (req, res) => {
    try {
        const debt = await Debt.findById(req.params.id);
        if (!debt) return res.status(404).json({ message: 'Debt not found' });
        res.json({ message: 'Debt deleted successfully' });
        if (debt.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Unauthorized: You cannot delete this record.' });
        }

        await debt.deleteOne();
        res.json({ message: 'Debt deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.patch('/:id/status', auth, async (req, res) => {
    try {
        const debt = await Debt.findById(req.params.id);
        if (!debt) return res.status(404).json({ message: 'Debt not found' });
        
        if (debt.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Unauthorized: You cannot update this record.' });
        }

        const updatedDebt = await Debt.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );

        res.json(updatedDebt);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;