const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true, // No two users can have the same name
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
    // Gmail Verification logic
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationToken: String,

    // Your Anime Lists (Replacing Local Storage)
    favourites: [{ type: Object }], // We store the whole anime object or just ID
    watchLater: [{ type: Object }],
    completed: [{ type: Object }],

    // Social & Progress
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
        default: ['Newcomer'] // Everyone starts with this!
    }
}, { timestamps: true }); // Automatically adds "Created At" and "Updated At" fields

module.exports = mongoose.model('User', UserSchema);