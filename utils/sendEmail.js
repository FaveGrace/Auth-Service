const admin = require('firebase-admin');

async function sendLoginEmail(email) {
    try{
        await admin.firestore().collection('mail').add({
            to: [email],
            message: {
                subject: 'Login Notification',
                text: 'You have successfully logged in to your account.',
                html: '<p> You have successfully logged into your account. If this was not you, please reach out to our support team on ...</p>'
            }
        });
        console.log('Login notification sent.');
    }catch(error){
        console.error('Email sending failed:', error.message);
    }
};

module.exports = {sendLoginEmail};