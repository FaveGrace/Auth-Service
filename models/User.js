const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firebaseUid: {type: String, require: true, unique: true},
    phone: {type: String, required: true, unique: true},
    email: {type: String, required: true, unique: true},
    name: {type: String, required: true},
    isVerified: {type: Boolean, default: false},
    otp: String,
    otpExpiry: Date,
    resetToken: String,
    resetTokenExpiry: Date
}, {timestamps: true});

const User = mongoose.model('User', userSchema);