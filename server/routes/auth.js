const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

const Profile= require("../models/profile");

// ... baki imports sahi hain

router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ message: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

        // Profile check logic (Sahi hai, par try-catch ke andar hona chahiye)
        const existingProfile = await Profile.findOne({ user: user._id });
        if (!existingProfile) {
            const profile = new Profile({
                user: user._id,
                bio: "", phone: "", gender: "", dob: null, avatar: "", location: "",
            });
            await profile.save();
        }

        const token = jwt.sign(
            { id: user._id, isHost: user.isHost },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        // TOKEN BHEJNA ZAROORI HAI YAHAN ✅
        res.json({
            token, 
            user: {
                id: user._id,
                name: user.name,
                isHost: user.isHost,
            }
        });
    }  catch (error) {
    console.error(error);
    res.status(500).json({ 
        message: "Server error during login", 
        asli_error: error.message // Ye line aapko bata degi ki problem kahan hai
    });
}
});
module.exports = router;