const jwt = require('jsonwebtoken')
const User = require('../models/User');

exports.authMiddleware = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if(!token) return res.status(401).json({message: 'No token provided.'});

    try{
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
        req.user = await User.findById(decoded.id);
        next();
    }catch(error) {
        return res.status(403).json({message: 'Invalid or expired token.'});
    }
};