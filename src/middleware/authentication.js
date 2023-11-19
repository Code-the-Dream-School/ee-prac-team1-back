const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { UnauthenticatedError } = require('../errors');

const auth = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer')) {
        console.log('Bearer Token Missing');
        throw new UnauthenticatedError('An Unexpected Error Happen: Your Authentication failed!');
    }
    const token = authHeader.split(' ')[1];
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        // Fetch the user from the database using the userId from the payload
        const user = await User.findById(payload.userId);
        if (!user) {
            throw new UnauthenticatedError('An Unexpected Error Occurred: User not found');
        }
        const updatedPayload = {
            userId: payload.userId,
            firstName: user.firstName,
        };
        req.user = updatedPayload;
        next();
    } catch (error) {
        throw new UnauthenticatedError('An Unexpected Error Occured: Your Authentication failed!')
    };
};

module.exports = auth;