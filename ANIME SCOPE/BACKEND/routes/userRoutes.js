
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const User = require('../models/User');


router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

router.post('/list/:listType', auth, async (req, res) => {
    try {
        const { animeData } = req.body; 
        const { listType } = req.params; 

        const user = await User.findById(req.user.id);

       
        const exists = user[listType].some(item => item.id === animeData.id);
        if (exists) return res.status(400).json({ msg: "Already in list" });

        user[listType].push(animeData);
        await user.save();
        res.json(user[listType]);
    } catch (err) {
        res.status(500).json({ msg: "Error saving to list" });
    }
});


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

router.post('/toggle-list', async (req, res) => {
    const { username, listType, anime, action } = req.body;

   
    if (!['favourites', 'watchLater', 'completed'].includes(listType)) {
        return res.status(400).json({ error: "Invalid list type" });
    }

    try {
        let updateQuery = {};
        if (action === 'add') {
          
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

router.post('/submit-rating', async (req, res) => {
    const { username, animeId, score } = req.body;
    try {
        
        await User.findOneAndUpdate(
            { username: username },
            { $pull: { ratings: { animeId: animeId } } }
        );
       
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




router.post('/clear-list', async (req, res) => {
    const { username, listType } = req.body;

    
    if (!['favourites', 'watchLater', 'completed'].includes(listType)) {
        return res.status(400).json({ error: "Invalid list type" });
    }

    try {
       
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


router.post('/remove-rating', async (req, res) => {
    const { username, animeId } = req.body;
    try {
       
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


router.post('/remove-comment', async (req, res) => {
    const { username, animeId, text } = req.body;
    try {
        
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


module.exports = router;