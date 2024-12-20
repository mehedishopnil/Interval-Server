const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const password = process.env.DBPASSWORD || "default_password";
const uri = `mongodb+srv://IntervalServer:${password}@cluster0.sju0f.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const client = new MongoClient(uri, {
  serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
});

async function run() {
  try {
    await client.connect();
    const db = client.db("Interval");
    const allResortDataCollection = db.collection("AllResorts");
    const usersCollection = db.collection("users");

    // API endpoints go here
    // ...

    console.log("Connected to MongoDB!");
    app.listen(port, () => console.log(`Server is running on Port ${port}`));
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1); // Terminate if connection fails
  }
}

// Health Check Endpoint
app.get("/", (req, res) => {
  res.json({ message: "Interval server is running", uptime: process.uptime() });
});

run().catch(console.dir);
