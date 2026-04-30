const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        let userExists = await User.findOne({ username });
        if (userExists) return res.status(400).json({ error: "User already exists" });
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ message: "User created!" });
    } catch (err) {
        res.status(500).json({ error: "Registration failed" });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const payload = {
            user: {
                id: user._id
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1d' },
            (err, token) => {
                if (err) throw err;
                res.json({ token, username: user.username });
            }
        );

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Login failed" });
    }
});
module.exports = router;