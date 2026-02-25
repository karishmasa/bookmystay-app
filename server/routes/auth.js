const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Models Import
const User = require("../models/User");
const Profile = require("../models/profile");

// --- MIDDLEWARE: Token Verify karne ke liye ---
const auth = (req, res, next) => {
    // Header se token nikalna
    const authHeader = req.header("Authorization");
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "No token, authorization denied" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Token se user id nikal kar request mein daal di
        next(); // Agle function par jao (Sabse zaroori!)
    } catch (error) {
        res.status(401).json({ message: "Token is not valid" });
    }
};

// --- 1. REGISTER ROUTE ---
router.post("/register", async (req, res) => {
    const { name, email, password, isHost } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: "User already exists" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({ name, email, password: hashedPassword, isHost });
        await user.save();

        // Auto-create profile for new user
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

// --- 2. LOGIN ROUTE ---
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

// --- 3. GET PROFILE ROUTE (Authenticated) ---
// Is route ke liye humne 'auth' middleware use kiya hai
router.get("/profile", auth, async (req, res) => {
    try {
        // req.user.id humein token se mil raha hai jo middleware ne set kiya
        const profile = await Profile.findOne({ user: req.user.id }).populate("user", ["name", "email"]);
        
        if (!profile) {
            return res.status(404).json({ message: "Profile not found" });
        }

        res.json(profile); // Response send kiya!
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server Error");
    }
});

module.exports = router;