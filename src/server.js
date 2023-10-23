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

// async function fetchListingsAndReviews() {
//   const client = new MongoClient(mongoURI);

//   try {
//     await client.connect();
//     console.log("✓ Connected to MongoDB");

//     const database = client.db("sample_airbnb");
//     const collection = database.collection("listingsAndReviews");

//     const query = {};
//     const projection = { name: 1, description: 1, _id: 0 }; // Select name and description fields

//     const cursor = collection.find(query).project(projection);

//     // Fetch the results as an array
//     const results = await cursor.toArray();

//     if (results.length > 0) {
//       console.log("Listings and Reviews:");
//       results.forEach((item) => {
//         console.log("Name:", item.name, "\n");
//       });
//     } else {
//       console.log("No results found.");
//     }
//   } catch (err) {
//     console.error("Error:", err);
//   } finally {
//     // Close the connection
//     client.close();
//   }
// }

start();
// fetchListingsAndReviews();
