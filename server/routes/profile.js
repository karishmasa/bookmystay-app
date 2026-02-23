const express = require("express");
const router=express.Router();
const Profile=require("../models/profile");
const auth =require("../middleware/auth");

//GET

router.get("/",auth,async(req,res)=>{
    try{
        const profile = await Profile.findOne({user:req.user.id});
 if(!profile) return res.status(404).json({message:"Profile not Found"})
    }catch(error){
res.status(500).json({message:"Server error"});
}
})
module.exports = router;