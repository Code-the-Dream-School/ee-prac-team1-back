const mongoose = require('mongoose');

const connectDB = (url) => {
    try {
        return mongoose.connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    };
};
module.exports = connectDB;