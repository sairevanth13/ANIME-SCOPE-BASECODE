const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true, 
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
   
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationToken: String,

   
    favourites: [{ type: Object }], 
    watchLater: [{ type: Object }],
    completed: [{ type: Object }],

   
    comments: [{
        animeId: String,
        text: String,
        date: { type: Date, default: Date.now }
    }],
    ratings: [{
        animeId: String,
        score: Number
    }],
    badges: {
        type: [String],
        default: ['Newcomer'] 
    }
}, { timestamps: true }); 

module.exports = mongoose.model('User', UserSchema);