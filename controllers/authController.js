const User = require('../models/User');
const {sendEmailOTP, sendSMSOTP} = require('../utils/email');
const generateOTP = require('../utils/Otp');
const crypto = require('crypto');

//Register user
exports.register = async (req, res) => {
    try{
        const {name, email, phone} = req.body;

        let user = await User.findOne({email});
        if(user){
            return res.status(400).json({message: 'User already exists.'});
        }

        const otp = generateOTP();

        user = await User.create({name, email, phone, otp, otpExpiry: Date.now() + 10 * 60 * 1000});

        await sendEmailOTP({email, otp});
        await sendSMSOTP({phone, otp});

        res.status(201).json({message: 'User successfully registered and OTP sent.'});
    }catch(error){
        res.status(500).json({message: 'Server error', error: error.message});
    }
};

//Verify otp
exports.otpVerification = async (req, res) => {
    try{
        const {email, otp} = req.body;

        const user = await User.findOne({email});
        if(!user || user.otp !== otp || user.otpExpiry < Date.now()){
            return res.status(400).json({message: 'Invalid or expired OTP.'});
        }
       
        user.isVerified = true;
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();

        res.status(200).json({message: 'Email verified successfully.'});
    }catch(error){
        res.status(500).json({message: 'Server error', error: error.message});
    }
};

exports.login = async (req, res) => {
    const {email} = req.body;

    try{
        //check if user exists
        const user = await User.findOne({email}).select('+password');
        if(!user || !user.isVerified){
            return res.status(400).json({message: 'User not verified or not found.'});
        }

        res.status(200).json({message: 'Login successful.',user});
    }catch(error){
        res.status(500).json({message: 'Server error.', error: error.message});
    }
};

exports.logout = async (req, res) => {
    try{
        const uid = req.user.uid;
        //this revokes refresh tokens so users must login again.
        await admin.auth().revokeRefreshToken(uid);

        res.status(200).json({message: 'Logout successful.'});
    }catch(error){
        console.error('Logout error:', error);
        res.status(500).json({message: 'Server error.', error: error.message});
    }
}

exports.forgotPassword = async (req, res) => {
    const {email} = req.body;

    try{
        const user = await User.findOne({email});
        if(!user) return res.status(404).json({message: 'User not found.'});

        //reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetToken = resetToken;
        user.resetTokenExpiry = Date.now() + 100 * 60 * 1000;
        await user.save();

        await sendEMail(email, `Reset link: http://localhost:7070/api/auth/reset/${resetToken}`);

        res.status(200).json({message: 'Password reset link sent.'});
    }catch(error){
        res.status(500).json({message: 'Server error.', error: error.message});
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

        res.status(200).json({message: 'Password reset successful.'});
    }catch(error){
        console.error('Reset password error:', error);
        res.status(500).json({message: 'Server error.', error: error.message});
    }
};

exports.updateProfile = async (req, res) => {
    try{
        const {email, name, phone}= req.body;
        const user = await User.findOneAndUpdate(
            {email},
            {name, phone},
            {new: true}
        );

        res.status(200).json({message: 'Profile updated successfully.', user});
    }catch(error){
        res.status(500).json({message: 'Internal server error.', error: error.message});
    }
};

exports.deleteProfile = async(req, res) => {
    try{
        const {email} = req.body;
        await User.findOneAndDelete({email});

        res.status(200).json({message: 'Profile deleted successfully.'});
    }catch(error){
        res.status(500).json({message: 'Server error.', error: error.message});
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
        
        await sendEmailOTP(user.email, otp);
        await sendSMSOTP(user.phone, otp);

        return res.status(200).json({message: 'New OTP sent.'});
    }catch(error){
        res.status(500).json({message: 'Server error.', error: error.message});
    }
};