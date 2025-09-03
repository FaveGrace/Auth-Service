const express = require('express'); 
const {register, otpVerification, resendOtp, login, refreshToken, logout, forgotPassword, resetPassword, updateProfile, deleteProfile} = require('../controllers/authController');
const {authMiddleware} = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/register', register);
router.post('/verify-otp', otpVerification);
router.post('/resend-otp', resendOtp);
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.put('/update-profile', authMiddleware, updateProfile);
router.delete('/delete-profile', authMiddleware, deleteProfile);

module.exports = router;