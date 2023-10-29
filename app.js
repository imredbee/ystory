const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

const mongoose = require('mongoose');

require('dotenv').config();
const mongoURI = process.env.MONGO_URI;
const secretKey = process.env.SECRET_KEY;

const MONGO_URI = mongoURI; // 실제 사용 시, .env 파일이나 환경 변수에서 가져오는 것을 추천합니다.

mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

mongoose.connection.once('open', () => {
    console.log('Connected to the MongoDB');
});

// server.js
const authRoutes = require('./routes/auth');

app.use('/auth', authRoutes);

const User = require('../models/User');

