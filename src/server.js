const mongoose = require("mongoose");
const { MongoClient } = require("mongodb");

require("dotenv").config();

const mongoURI = process.env.MONGO_URI;

const { PORT = 8000 } = process.env;
const app = require("./app");

const listener = () =>
  console.log(
    `✓ Listening on Port ${PORT}!\n http://localhost:${PORT}/api/v1/`
  );
app.listen(PORT, listener);

const start = async () => {
  mongoose
    .connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log("✓ Connected to MongoDB");
    })
    .catch((err) => {
      console.error("𐄂 Error connecting to MongoDB:", err);
    });
};

start();

