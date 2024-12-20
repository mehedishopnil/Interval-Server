const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const uri = `mongodb+srv://IntervalServer:${process.env.DB_PASS}@cluster0.sju0f.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server
    await client.connect();

    // Access the target database:
    const db = client.db("Interval");

    // Access collections correctly
    const allResortDataCollection = db.collection("AllResorts");
    const usersCollection = db.collection("users");

   

    // Get all user data without pagination
    app.get("/all-users", async (req, res) => {
      try {
        const users = await usersCollection.find().toArray();
        res.send(users);
      } catch (error) {
        console.error("Error fetching all user data:", error);
        res.status(500).send("Internal Server Error");
      }
    });




    // Get all resort data without pagination
    app.get("/all-resorts", async (req, res) => {
      try {
        const resorts = await allResortDataCollection.find().toArray();
        res.send(resorts);
      } catch (error) {
        console.error("Error fetching all resort data:", error);
        res.status(500).send("Internal Server Error");
      }
    });

    

    // Set up your routes here

    // Start the server after successful connection
    app.listen(port, () => {
      console.log(`Airbnb server is running on Port ${port}`);
    });
  } catch (error) {
    console.error("Error running the server:", error);
  }
}

// Route for health check
app.get("/", (req, res) => {
  res.send("Brian Caceres RCI server is running");
});

run().catch(console.dir);