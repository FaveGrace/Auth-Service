const express = require('express'); 
const {register, otpVerification, login, logout, updateProfile, deleteProfile, resendOtp, forgotPassword, resetPassword} = require('../controllers/authController');
const router = express.Router();

router.post('/register', register);
router.post('/verify-otp', otpVerification);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.put('/update-profile', updateProfile);
router.delete('/delete-profile', deleteProfile);
router.post('/resend-otp', resendOtp);
router.post('/logout', logout);

module.exports = router;