const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const app = express();
const port = 3000;
const cors = require('cors');
app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const jwt = require('jsonwebtoken');

mongoose.connect('mongodb+srv://10tabassum2:Tabassum@cluster0.35w7xti.mongodb.net/test', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.log('Error Connecting to MongoDB:', err);
});

app.listen(port, () => {
  console.log('Server is running on port 3000');
});

const User = require("./models/user");
const Post = require("./models/post");

//endpoint to register an user to backend

app.post("/register", async(req, res) => {
  try{
    const { name, email, password} =  req.body;

    const existingUser =  await User.findOne(email);
    if(existingUser){
      return res.status(400).json({ message: "Email already registered"})
    }
    
    // create a new user
    const newUser =  new User({name, email, password});

    //generate and store the verification token
    newUser.verificationToken = crypto.randomBytes(20).toString("hex")

    //save the user to the database
    await newUser.save();

    //send the verification email to the user
    sendVerificationEmail(newUser.email, newUser.verificationToken)

    res.status(200).json({message: "Registration successful", "please check your email for verfication"})

  }catch(error){
    console.log("error registring user", error)
    res.status(500).json({
      message: "error registrating user"
    })
  }
})

const sendVerificationEmail = async(email, verificationToken) => {
   //create a nodemailer transporter

   const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "10tabassum2@gmail.com",
      pass: "bwla huyu movq pubh"
    }
   })

   const mailOptions = {
    from: "threads.com",
    to: email,
    subject: "Email Verification",
    text: `please click the following link to verify your email http://localhost:3000/verify/${verificationToken}`
   }

   try{
     await transporter.sendMail(mailOptions)
   }catch(error){
      console.log("error sending email", error)
   }
}

app.get("/verify/:token", async(req, res) => {
  try{
    const token = req.params.token;

    const user = await User.findOne({verificationToken: token});
    if(!user){
      return res.status(404).json({message: "Invalid token"});
    }

    user.verified = true;
    user.verificationToken = undefined;
    await user.save();

    res.status(200).json({message: "Email verified successfully"})
  }catch(error){
    console.log("error getting token", error)
    res.status(500).json({message: "Email verification failed"})
  }
})


app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Invalid email" });
    }

    if (user.password !== password) {
      return res.status(404).json({ message: "Invalid password" });
    }

    const token = jwt.sign({ userId: user._id }, secretKey);

    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: "Login failed" });
  }
});