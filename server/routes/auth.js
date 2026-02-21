const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

const Profile= require("../models/profile");

router.post("/register",async (req,res)=>{
    const {name,email,password}=req.body;
    try{
const salt = await bcrypt.genSalt(10);
const hashedPassword = await bcrypt.hash(password,salt);
const user=new User({name,email,password:hashedPassword});
await user.save();

const profile= new Profile({
    user:user._id,
    bio:"",
    phone:"",
    gender:"",
    dob:null,
    avatar:"",
    location: "",
});
await profile.save();

const token = jwt.sign({id:user._id},process.env.JWT_SECRET,{
    expiresIn:"1d",
});
res.status(201).json({token,user});
}catch(error){
console.error(error);
res.status(500).json({message:"Error creating user"});
    }
});

module.exports = router;