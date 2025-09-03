const nodemailer = require('nodemailer');

exports.verificationMail = async (email, name, otp) => {
    try{
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    const mailDetails = {
        from: `${process.env.EMAIL}`,
        to: email,
        subject: 'Verify Your Email',
        text: `Hello ${name}, your OTP is ${otp} and this expires in 10 minutes.

        ${otp}`
    }

    await transporter.sendMail(mailDetails);
    } catch (error) {
    console.error('Error sending email:', error.message);
    }
};

exports.loginMail = async (email) => {
    try{
        let mailTransport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        let mailDetails = {
            from: `${process.env.EMAIL}`,
            to: email,
            subject: 'Login Notification',
            text: `Hello, you have successfully logged in. If you did not initiate this login, please contact support at userauth@service.com or 0208193664862.`
        };

        await mailTransport.sendMail(mailDetails);
    } catch (error) {
        console.error('Error sending email:', error.message);
    }
};

exports.resetPasswordMail = async (email, resetToken) => {
    try{
        let mailTransport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        let mailDetails = {
            from: `${process.env.EMAIL}`,
            to: email,
            subject: 'Password Reset',
            text: `Hello, you requested a password reset. Please use the following link to reset your password: http://localhost:7070/api/auth/reset-password/${resetToken}
            
            ${resetToken}`
        };

        await mailTransport.sendMail(mailDetails);
    } catch (error) {
        console.error('Error sending email:', error.message);
    }
}

exports.resendOTPMail = async (email, otp) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        const mailDetails = {
            from: `${process.env.EMAIL}`,
            to: email,
            subject: 'Resend OTP',
            text: `Hello, your OTP is ${otp} and this expires in 10 minutes.

            ${otp}`
        };

        await transporter.sendMail(mailDetails);
    } catch (error) {
        console.error('Error sending email:', error.message);
    }
};

exports.profileUpdateMail = async (email, user) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        const mailDetails = {
            from: `${process.env.EMAIL}`,
            to: email,
            subject: 'Profile Update Notification',
            text: `Hello ${user.name}, your profile has been successfully updated. If you did not make this change, please contact support at userauth@service.com or 0208193664862.`
        };

        await transporter.sendMail(mailDetails);
    } catch (error) {
        console.error('Error sending email:', error.message);
    }
};