const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { UnauthenticatedError } = require('../errors');

const auth = async (req, res, next) => {
    // check auth. header and check if starts with "Bearer "
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer')) {
        throw new UnauthenticatedError('An Unexpected Error Happen: Your Authentication failed!');
    }
    //splitting string to get token as second value in array [Bearer_token] to verify it
    const token = authHeader.split(' ')[1];
    // token veritification
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        // attach the user to the activity routes
        req.user = { userId: payload.userId };
        console.log(req.user);
        next();
    } catch (error) {
        throw new UnauthenticatedError('An Unexpected Error Occured: Your Authentication failed!')
    };
};

module.exports = auth;