const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true }
    // 기타 필요한 필드 추가
});

module.exports = mongoose.model('User', UserSchema);
