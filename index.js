const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Ensure the environment variable is loaded
if (!process.env.DBPASSWORD) {
  console.error("Error: DBPASSWORD is not set in the environment variables.");
  process.exit(1);
}

// MongoDB connection URI
const uri = `mongodb+srv://IntervalServer:${process.env.DBPASSWORD}@cluster0.sju0f.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let db, allResortDataCollection, usersDataCollection;

// Connect to MongoDB
async function run() {
  try {
    await client.connect();
    db = client.db("Interval");
    allResortDataCollection = db.collection("AllResorts");
    usersDataCollection = db.collection("users");
    console.log("Connected to MongoDB successfully!");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error.message);
    process.exit(1); // Exit if unable to connect
  }
}

// Routes

// Home Route
app.get("/", (req, res) => {
  res.send("Interval server is running");
});

// POST: Add User
app.post("/users", async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).send("Name and email are required");
    }

    const existingUser = await usersDataCollection.findOne({ email });
    if (existingUser) {
      return res.status(409).send("User with this email already exists");
    }

    const result = await usersDataCollection.insertOne(req.body);
    res.status(201).send({
      message: "User successfully added",
      userId: result.insertedId,
    });
  } catch (error) {
    console.error("Error adding user:", error.message);
    res.status(500).send("Internal Server Error");
  }
});

// GET: Fetch User by Email
app.get("/users", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).send("Email query parameter is required");
    }

    const user = await usersDataCollection.findOne({ email });
    if (!user) {
      return res.status(404).send("User not found");
    }
    res.send(user);
  } catch (error) {
    console.error("Error fetching user data:", error.message);
    res.status(500).send("Internal Server Error");
  }
});

// GET: Fetch All Users
app.get("/all-users", async (req, res) => {
  try {
    const users = await usersDataCollection.find().toArray();
    res.send(users);
  } catch (error) {
    console.error("Error fetching all users:", error.message);
    res.status(500).send("Internal Server Error");
  }
});

// PATCH: Update User Role to Admin
app.patch("/update-user", async (req, res) => {
  try {
    const { email, isAdmin } = req.body;
    if (!email || typeof isAdmin !== "boolean") {
      return res.status(400).send("Email and isAdmin status are required");
    }

    const result = await usersDataCollection.updateOne(
      { email },
      { $set: { isAdmin } }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).send("User not found or role not updated");
    }

    res.send({ success: true, message: "User role updated successfully" });
  } catch (error) {
    console.error("Error updating user role:", error.message);
    res.status(500).send("Internal Server Error");
  }
});

// PATCH: Update User Information
app.patch("/update-user-info", async (req, res) => {
  try {
    const { email, ...updateData } = req.body;
    if (!email) {
      return res.status(400).send("Email is required");
    }

    const result = await usersDataCollection.updateOne(
      { email },
      { $set: updateData }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).send("User not found or information not updated");
    }

    res.send({ success: true, message: "User information updated successfully" });
  } catch (error) {
    console.error("Error updating user info:", error.message);
    res.status(500).send("Internal Server Error");
  }
});

// GET: Fetch All Resorts
app.get(" ", async (req, res) => {
  try {
    const resorts = await allResortDataCollection.find().toArray();
    res.send(resorts);
  } catch (error) {
    console.error("Error fetching resorts:", error.message);
    res.status(500).send("Internal Server Error");
  }
});

// Start the Server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Initialize MongoDB Connection
run().catch((error) => {
  console.error("Error initializing server:", error.message);
});
