const admin = require('firebase-admin/auth');

const sendSMSOTP = async (phone, otp) => {
    try{
        console.log(`Sending SMS to ${phone}: ${otp}`);
        return true;
    }catch(error){
        console.error('Error sending SMS OTP:', error.message);
        return false;
    }
};

module.exports = sendSMSOTP;