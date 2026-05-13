const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken'); 
const User = require('../models/User');


const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
   
    tls: {
        rejectUnauthorized: false
    },
    connectionTimeout: 10000, 
    dnsLookup: (hostname, options, callback) => {
        require('dns').lookup(hostname, { family: 4 }, callback);
    }
});


transporter.verify((error, success) => {
    if (error) {
        console.error('❌ Email Config Error:', error.message);
    } else {
        console.log('✅ Email service ready to Summon!');
    }
});





router.post('/signup', async (req, res) => {
    try {
        const username = req.body.username?.trim();
        const email = req.body.email?.trim().toLowerCase();
        const password = req.body.password;

        if (!username || !email || !password) return res.status(400).json({ msg: "Missing signup fields" });

      
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: "Email already registered" });

       
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

       
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

       
        user = new User({
            username,
            email, 
            password: hashedPassword,
            verificationToken: verificationCode,
            isVerified: false 
        });

        await user.save();

       
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Verify your AnimeScope Account',
            html: `<h1>Welcome to AnimeScope!</h1>
                   <p>Your verification code is: <b>${verificationCode}</b></p>`
        };

        try {
            await transporter.sendMail(mailOptions);
            console.log('✅ Email sent successfully to', email);
        } catch (emailErr) {
            console.error('❌ Email send failed:', emailErr.message);
            return res.status(500).json({ msg: `Email Error: ${emailErr.message}` });
        }
        
        res.status(201).json({ msg: "Signup successful! Please check your email for the code." });

    } catch (err) {
        console.error('❌ Signup Error:', err);
        res.status(500).json({ msg: "Server Error: " + err.message });
    }
});


router.post('/verify', async (req, res) => {
    try {
        const email = req.body.email?.trim().toLowerCase();
        const code = req.body.code;

        if (!email || !code) return res.status(400).json({ msg: "Invalid verification request" });

      
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ msg: "User not found" });
        if (user.verificationToken !== code) return res.status(400).json({ msg: "Invalid Code" });

        
        user.isVerified = true;
        user.verificationToken = undefined; 
        await user.save();

        res.status(200).json({ msg: "Email verified successfully! You can now login." });

    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server Error" });
    }
});


router.post('/login', async (req, res) => {
    try {
        const email = req.body.email?.trim();
        const username = req.body.username?.trim();
        const password = req.body.password;

        if (!password || (!email && !username)) return res.status(400).json({ msg: "Missing login fields" });

       
        let user;
        if (email) {
            user = await User.findOne({ email: email.toLowerCase() });
        } else if (username) {
            user = await User.findOne({ username });
        }

        if (!user) return res.status(400).json({ msg: "Invalid Credentials" });

  
        if (!user.isVerified) return res.status(400).json({ msg: "Please verify your Gmail first!" });

     
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: "Invalid Credentials" });

   
        const token = jwt.sign(
            { id: user._id }, 
            process.env.JWT_SECRET || 'animescope_secret_key_123', 
            { expiresIn: '2h' }
        );

   
        res.json({ 
            token, 
            user: { username: user.username, email: user.email } 
        });

    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ msg: "Server Error" });
    }
});

module.exports = router;                                                                                                                         