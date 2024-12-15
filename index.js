const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

console.log(process.env.DBPASSWORD)

// MongoDB connection URI
const uri = `mongodb+srv://IntervalServer:${process.env.DBPASSWORD}@cluster0.sju0f.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let db; // Declare `db` and collection variables
let allResortDataCollection;

async function run() {
  try {
    // Connect to MongoDB
    await client.connect();

    // Initialize `db` and collection variables after connection
    db = client.db("Interval"); // Replace "Interval" with your actual database name
    allResortDataCollection = db.collection("AllResorts"); // Replace with your collection name

    console.log("Connected to MongoDB successfully!");
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
    process.exit(1); // Exit if unable to connect
  }
}

run(); // Call the run function to connect to MongoDB

// Routes
app.get("/", (req, res) => {
  res.send("Interval server is running");
});

// Get all resort data without pagination
app.get("/all-resorts", async (req, res) => {
  try {
    if (!allResortDataCollection) {
      return res.status(500).send("Database not initialized");
    }

    const resorts = await allResortDataCollection.find().toArray();
    res.send(resorts);
  } catch (error) {
    console.error("Error fetching all resort data:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Example route
app.get("/example", async (req, res) => {
  try {
    if (!db) {
      return res.status(500).send("Database not initialized");
    }

    const collection = db.collection("yourCollectionName"); // Replace with your collection name
    const data = await collection.find({}).toArray();
    res.send(data);
  } catch (error) {
    res.status(500).send({ message: "Error fetching data", error });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
