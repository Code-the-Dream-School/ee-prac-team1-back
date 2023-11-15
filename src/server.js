const app = require('./app');
// connectDB
const connectDB = require('./db/connect');

require('dotenv').config();

const port = process.env.PORT || 8000;

const start = async () => {
  try {
    // connectDB
    await connectDB(process.env.MONGO_URI);
    console.log('✓ Connected to MongoDB');
    app.listen(port, console.log(
      `✓ Listening on Port ${port}! http://localhost:${port}/api/v1/`));
  } catch (error) {
    console.error('𐄂 Error connecting to MongoDB:', error);
  };
};
start();
