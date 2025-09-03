const jwt = require('jsonwebtoken');

exports.generateAccessToken = (user) => {
    return jwt.sign({ id: user._id }, 
    process.env.ACCESS_TOKEN, 
    { expiresIn: '1h' });
};

exports.generateRefreshToken = (user) => {
    return jwt.sign({ id: user._id }, 
    process.env.REFRESH_TOKEN, 
    { expiresIn: '7d' });
};