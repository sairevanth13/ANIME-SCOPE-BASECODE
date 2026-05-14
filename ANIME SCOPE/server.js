require('dotenv').config({ path: './BACKEND/.env' });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// --- 1. MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// --- 2. DATABASE CONNECTION ---
// --- 2. DATABASE CONNECTION ---
const myURI = "mongodb://scope_admin:K557z5CBmEX2k2mo@ac-ofoekzf-shard-00-00.orsu5kz.mongodb.net:27017,ac-ofoekzf-shard-00-01.orsu5kz.mongodb.net:27017,ac-ofoekzf-shard-00-02.orsu5kz.mongodb.net:27017/?ssl=true&replicaSet=atlas-tmpf1v-shard-0&authSource=admin&appName=AnimeScope-Mainframe";

mongoose.connect(myURI)
  .then(() => console.log('✅ MongoDB Connected Successfully, bro!'))
  .catch((err) => console.log('❌ MongoDB Connection Error: ', err));

// --- 3. API ROUTES ---
// Updated paths to include the 'BACKEND' folder
app.use('/api/auth', require('./BACKEND/routes/auth'));
app.use('/api/users', require('./BACKEND/routes/userRoutes'));

// --- 4. FRONTEND SERVING ---
// Points to the 'FRONTEND' folder in your root
app.use(express.static(path.join(__dirname, 'FRONTEND')));

// The SPA catch-all
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'FRONTEND', 'index.html'));
});

// --- 5. START SERVER ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 AnimeScope is LIVE at http://localhost:${PORT}`);
});