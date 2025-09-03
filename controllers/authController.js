const User = require('../models/User');
const {verificationMail, loginMail, resetPasswordMail, resendOTPMail, profileUpdateMail} = require('../utils/email');
const generateOTP = require('../utils/Otp');
const {generateAccessToken, generateRefreshToken} = require('../utils/token');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

//Register user
exports.register = async (req, res) => {
    try{
        const {name, email, password} = req.body;

        const existing = await User.findOne({email});
        if(existing){
            return res.status(400).json({message: 'User already exists.'});
        }

        const otp = generateOTP();
        const otpExpiry = Date.now() + 10 * 60 * 1000;

        const user = await User.create({name, email, password, otp, otpExpiry});

        await verificationMail(user.email, user.name, otp);

        return res.status(201).json({message: 'User successfully registered and OTP sent.'});
    }catch(error){
        return res.status(500).json({message: 'Server error', error: error.message});
    }
};

//Verify otp
exports.otpVerification = async (req, res) => {
    try{
        const {email, otp} = req.body;

        const user = await User.findOne({email});
        if(!user || user.otp !== otp){
            return res.status(400).json({message: 'Invalid or expired OTP.'});
        }
       
        user.isVerified = true;
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();

        return res.status(200).json({message: 'Email verified successfully.'});
    }catch(error){
        return res.status(500).json({message: 'Server error', error: error.message});
    }
};

exports.resendOtp = async (req, res) => {
    try{
        const {email} = req.body;

        const user = await User.findOne({email});
        if(!user) return res.status(404).json({message: 'User not found.'});

        const otp = generateOTP();
        user.otp = otp;
        user.otpExpiry = Date.now() + 10 * 60 * 1000; //10 mins. 
        await user.save();

        await resendOTPMail(email, otp);

        return res.status(200).json({message: 'New OTP sent.'});
    }catch(error){
        return res.status(500).json({message: 'Server error.', error: error.message});
    }
};

exports.login = async (req, res) => {
    const {email, password} = req.body;
    if(!email || !password) return res.status(400).json({message: 'Please provide email and password.'});

    try{
        //check if user exists
        const user = await User.findOne({email});
        if(!user || !user.isVerified){
            return res.status(400).json({message: 'User not verified or not found.'});
        }

        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        user.refreshToken = refreshToken;
        await user.save();

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        await loginMail(email, accessToken);

        return res.status(200).json({
            message: 'Login successful.',
            accessToken,
            user
        });
    }catch(error){
        return res.status(500).json({message: 'Server error.', error: error.message});
    }
};

exports.refreshToken = async (req, res) => {
    try{
        const refreshToken = req.cookies?.refreshToken;
        if(!refreshToken) return res.status(400).json({message: 'Please provide refresh token.'});

        let decoded;
        try{
            decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN);
        }catch(error){
            return res.status(403).json({message: 'Invalid refresh token.', error: error.message});
        }

        const user = await User.findById(decoded.id);
        if(!user) return res.status(404).json({message: 'User not found.'});

        const newAccessToken = generateAccessToken(user._id);
        const newRefreshToken = generateRefreshToken(user._id);

        user.refreshToken = newRefreshToken;
        await user.save();

        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        return res.status(200).json({
            message: 'Access token refreshed', 
            accessToken: newAccessToken
        });
    }catch(error){
        return res.status(500).json({message: 'Server error.', error: error.message});
    }
};

exports.logout = async (req, res) => {
    try{
        const refreshToken = req.cookies.refreshToken;
        if(!refreshToken) return res.status(400).json({message: 'Refresh token not found.'});

        const user = await User.findOne({refreshToken});
        if(!user) return res.status(404).json({message: 'User not found.'});

        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict'
        });

        user.refreshToken = undefined;
        await user.save();

        return res.status(200).json({message: 'Logout successful.'});
    }catch(error){
        console.error('Logout error:', error);
        return res.status(500).json({message: 'Server error.', error: error.message});
    }
};

exports.forgotPassword = async (req, res) => {
    const {email} = req.body;

    try{
        const user = await User.findOne({email});
        if(!user) return res.status(404).json({message: 'User not found.'});

        //reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetToken = resetToken;
        user.resetTokenExpiry = Date.now() + 60 * 60 * 1000;
        await user.save();

        await resetPasswordMail(email, resetToken);

        return res.status(200).json({message: 'Password reset link sent.'});
    }catch(error){
        return res.status(500).json({message: 'Server error.', error: error.message});
    }
};

exports.resetPassword = async (req, res) => {
    const {token} = req.params;
    const {newPassword} = req.body;

    try{
        const user = await User.findOne({resetToken: token, resetTokenExpiry: {$gt: Date.now()}});
        if(!user) return res.status(404).json({message: 'User not found.'});

        user.password = newPassword;
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;
        await user.save();

        return res.status(200).json({message: 'Password reset successful.'});
    }catch(error){
        console.error('Reset password error:', error);
        return res.status(500).json({message: 'Server error.', error: error.message});
    }
};

exports.updateProfile = async (req, res) => {
    try{
        const {email, name}= req.body;
        const user = await User.findOneAndUpdate(
            {email},
            {name},
            {new: true}
        );

        await profileUpdateMail(email, name);

        return res.status(200).json({message: 'Profile updated successfully.', user});
    }catch(error){
        return res.status(500).json({message: 'Internal server error.', error: error.message});
    }
};

exports.deleteProfile = async(req, res) => {
    try{
        const {email} = req.body;
        await User.findOneAndDelete({email});

        return res.status(200).json({message: 'Profile deleted successfully.'});
    }catch(error){
        return res.status(500).json({message: 'Server error.', error: error.message});
    }
};