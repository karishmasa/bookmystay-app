const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const Profile = require("../models/profile");

// 1. REGISTER ROUTE (Ye missing tha)
router.post("/register", async (req, res) => {
    const { name, email, password, isHost } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: "User already exists" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({ name, email, password: hashedPassword, isHost });
        await user.save();

        // Auto-create profile
        const profile = new Profile({
            user: user._id,
            bio: "", phone: "", gender: "", dob: null, avatar: "", location: "",
        });
        await profile.save();

        const token = jwt.sign({ id: user._id, isHost: user.isHost }, process.env.JWT_SECRET, { expiresIn: "1d" });

        res.status(201).json({ token, user: { id: user._id, name, isHost: user.isHost } });
    } catch (error) {
        res.status(500).json({ message: "Register error", error: error.message });
    }
});

// 2. LOGIN ROUTE (Sirf ek baar)
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ message: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

        const token = jwt.sign({ id: user._id, isHost: user.isHost }, process.env.JWT_SECRET, { expiresIn: "1d" });

        res.json({ token, user: { id: user._id, name: user.name, isHost: user.isHost } });
    } catch (error) {
        res.status(500).json({ message: "Login error", error: error.message });
    }
});

module.exports = router;