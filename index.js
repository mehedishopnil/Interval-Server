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


async function run() {
  try {
    // Connect to MongoDB
    await client.connect();


    // Initialize `db` and collection variables after connection
   const db = client.db("Interval"); 
   const allResortDataCollection = db.collection("AllResorts");
   const usersDataCollection = db.collection("users");



    console.log("Connected to MongoDB successfully!");
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
    process.exit(1); // Exit if unable to connect
  }
}


// Posting Users data to MongoDB database
app.post("/users", async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).send("Name and email are required");
    }

    // Check if user with the same email already exists
    const existingUser = await usersDataCollection.findOne({ email });
    if (existingUser) {
      return res.status(409).send("User with this email already exists");
    }

    console.log(req.body); // Logs posted user data for debugging (optional)
    const result = await usersDataCollection.insertOne(req.body);

    res.status(201).send({
      message: "User successfully added",
      userId: result.insertedId,
    });
  } catch (error) {
    console.error("Error adding user data:", error.message);
    res.status(500).send("Internal Server Error");
  }
});

// GET endpoint to fetch user data by email
app.get("/users", async (req, res) => {
  const { email } = req.query;

  try {
    const user = await usersDataCollection.findOne({ email: email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Get all user data without pagination
app.get("/all-users", async (req, res) => {
  try {
    const users = await usersDataCollection.find().toArray();
    res.send(users);
  } catch (error) {
    console.error("Error fetching all user data:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Update user role to admin
app.patch("/update-user", async (req, res) => {
  const { email, isAdmin } = req.body;

  try {
    // Ensure that email and isAdmin are provided
    if (!email || typeof isAdmin !== "boolean") {
      console.error(
        "Validation failed: Email or isAdmin status is missing"
      );
      return res.status(400).send("Email and isAdmin status are required");
    }

    // Debugging: Log the email and isAdmin
    console.log(`Updating user: ${email}, isAdmin: ${isAdmin}`);

    // Update user role
    const result = await usersDataCollection.updateOne(
      { email: email },
      { $set: { isAdmin: isAdmin } }
    );

    // Debugging: Log the result of the update operation
    console.log(`Update result: ${JSON.stringify(result)}`);

    if (result.modifiedCount === 0) {
      console.error("User not found or role not updated");
      return res.status(404).send("User not found or role not updated");
    }

    res.send({ success: true, message: "User role updated successfully" });
  } catch (error) {
    console.error("Error updating user role:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Update or add user info (any incoming data)
app.patch("/update-user-info", async (req, res) => {
  const { email, age, securityDeposit, idNumber } = req.body;

  try {
    const result = await usersDataCollection.updateOne(
      { email: email },
      { $set: { age, securityDeposit, idNumber } }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found or information not updated.",
      });
    }

    res.json({
      success: true,
      message: "User information updated successfully.",
    });
  } catch (error) {
    console.error("Error updating user info:", error);
    res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
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



// Routes
app.get("/", (req, res) => {
  res.send("Interval server is running");
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


run().catch(console.dir);