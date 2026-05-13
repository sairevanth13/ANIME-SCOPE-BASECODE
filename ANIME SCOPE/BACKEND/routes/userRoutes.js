// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const User = require('../models/User');

// --- 1. GET USER PROFILE & LISTS ---
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// --- 2. ADD TO A LIST (Favourites, Watch Later, etc.) ---
// Usage: POST to /api/user/list/favourites
router.post('/list/:listType', auth, async (req, res) => {
    try {
        const { animeData } = req.body; // The anime object (id, title, image)
        const { listType } = req.params; // 'favourites', 'watchLater', or 'completed'

        const user = await User.findById(req.user.id);

        // Check if anime is already in the list
        const exists = user[listType].some(item => item.id === animeData.id);
        if (exists) return res.status(400).json({ msg: "Already in list" });

        user[listType].push(animeData);
        await user.save();
        res.json(user[listType]);
    } catch (err) {
        res.status(500).json({ msg: "Error saving to list" });
    }
});

// --- 3. REMOVE FROM A LIST ---
router.delete('/list/:listType/:animeId', auth, async (req, res) => {
    try {
        const { listType, animeId } = req.params;
        const user = await User.findById(req.user.id);

        user[listType] = user[listType].filter(item => item.id !== animeId);
        await user.save();
        res.json(user[listType]);
    } catch (err) {
        res.status(500).json({ msg: "Error removing item" });
    }
});
// Make sure your User model is imported at the top of this file!

// 1. DYNAMIC ROUTE FOR LISTS (Favourites, Watch Later, Completed)
// This handles all 3 button types using the "listType" variable!
router.post('/toggle-list', async (req, res) => {
    const { username, listType, anime, action } = req.body;

    // Security check: ensure listType is exactly one of our schema arrays
    if (!['favourites', 'watchLater', 'completed'].includes(listType)) {
        return res.status(400).json({ error: "Invalid list type" });
    }

    try {
        let updateQuery = {};
        if (action === 'add') {
            // Use [listType] to dynamically select the array in your schema
            updateQuery = { $push: { [listType]: anime } };
        } else if (action === 'remove') {
            updateQuery = { $pull: { [listType]: { mal_id: anime.mal_id } } };
        }

        await User.findOneAndUpdate({ username: username }, updateQuery);
        res.status(200).json({ message: `${listType} updated successfully!` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error syncing list" });
    }
});

// 2. ROUTE FOR RATINGS
router.post('/submit-rating', async (req, res) => {
    const { username, animeId, score } = req.body;
    try {
        // First, pull any existing rating for this specific anime so they don't duplicate
        await User.findOneAndUpdate(
            { username: username },
            { $pull: { ratings: { animeId: animeId } } }
        );
        // Then, push the new updated score
        await User.findOneAndUpdate(
            { username: username },
            { $push: { ratings: { animeId: animeId, score: score } } }
        );
        res.status(200).json({ message: "Rating saved!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error saving rating" });
    }
});

// 3. ROUTE FOR COMMENTS
router.post('/add-comment', async (req, res) => {
    const { username, animeId, text } = req.body;
    try {
        await User.findOneAndUpdate(
            { username: username },
            { $push: { comments: { animeId: animeId, text: text, date: new Date() } } }
        );
        res.status(200).json({ message: "Comment posted!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error saving comment" });
    }
});



// --- ADD THIS NEW CLEAR-LIST ROUTE ---
router.post('/clear-list', async (req, res) => {
    const { username, listType } = req.body;

    // Security check: match your User.js schema names
    if (!['favourites', 'watchLater', 'completed'].includes(listType)) {
        return res.status(400).json({ error: "Invalid list type" });
    }

    try {
        // Use $set to reset the specific array to empty []
        await User.findOneAndUpdate(
            { username: username },
            { $set: { [listType]: [] } }
        );
        res.status(200).json({ message: `${listType} wiped from mainframe successfully!` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error clearing list" });
    }
});

// --- MOVE THIS ROUTE ABOVE MODULE.EXPORTS ---
router.get('/data/:username', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        res.status(200).json({
            email: user.email,             
            createdAt: user.createdAt,
           favourites: user.favourites || [],
            watchLater: user.watchLater || [],
            completed: user.completed || [],
            ratings: user.ratings || [],  
            comments: user.comments || []  
        });
    } catch (error) {
        console.error("Failed to fetch user data:", error);
        res.status(500).json({ message: "Server error fetching data" });
    }
});

// --- ROUTE TO REMOVE A RATING ---
router.post('/remove-rating', async (req, res) => {
    const { username, animeId } = req.body;
    try {
        // Use $pull to remove the rating object that matches the animeId
        await User.findOneAndUpdate(
            { username: username },
            { $pull: { ratings: { animeId: String(animeId) } } }
        );
        res.status(200).json({ message: "Rating purged from mainframe." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error removing rating" });
    }
});

// --- ROUTE TO REMOVE A COMMENT ---
router.post('/remove-comment', async (req, res) => {
    const { username, animeId, text } = req.body;
    try {
        // Since comments don't have unique IDs in your schema, we match by animeId and the text
        await User.findOneAndUpdate(
            { username: username },
            { $pull: { comments: { animeId: String(animeId), text: text } } }
        );
        res.status(200).json({ message: "Comment erased from the archive." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error removing comment" });
    }
});

// THIS MUST BE THE ABSOLUTE LAST LINE OF THE FILE
module.exports = router;