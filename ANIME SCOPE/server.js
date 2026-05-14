require('dotenv').config({ path: require('path').join(__dirname, 'BACKEND/.env') });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();


app.use(cors());
app.use(express.json());


const myURI = "mongodb://scope_admin:K557z5CBmEX2k2mo@ac-ofoekzf-shard-00-00.orsu5kz.mongodb.net:27017,ac-ofoekzf-shard-00-01.orsu5kz.mongodb.net:27017,ac-ofoekzf-shard-00-02.orsu5kz.mongodb.net:27017/?ssl=true&replicaSet=atlas-tmpf1v-shard-0&authSource=admin&appName=AnimeScope-Mainframe";

mongoose.connect(myURI)
  .then(() => console.log('✅ MongoDB Connected Successfully, bro!'))
  .catch((err) => console.log('❌ MongoDB Connection Error: ', err));


app.use('/api/auth', require('./BACKEND/routes/auth'));
app.use('/api/users', require('./BACKEND/routes/userRoutes'));


app.use(express.static(path.join(__dirname, 'FRONTEND')));


app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'FRONTEND', 'index.html'));
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 AnimeScope is LIVE at https://localhost:${PORT}`);
});