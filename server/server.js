const express = require("express");
const cors = require("cors");
const mongoose=require("mongoose");
require("dotenv").config();

const authRoutes= require("./routes/auth");
const profileRoutes=require("./routes/profile")

const app = express();
app.use(cors());
app.use(express.json());

app.get("/",(req,res)=>{
res.send("Api is running...");
});

app.use("/api/auth",authRoutes);
app.use("/api/profile",profileRoutes)

mongoose
.connect(process.env.MONGO_URI)
.then(()=>console.log("Mongodb connected"))
.catch(err => console.log(err))

app.listen(5050,()=>console.log("Server running on port 5050"));
