import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// Import Models
import User from "./models/user.model.js";
import Note from "./models/note.model.js";

// Middleware for Token Authentication
import authenticateToken from "./utilities.js";

// Load Environment Variables
dotenv.config();

// Initialize Express App
const app = express();

// Connect to MongoDB
const connectToDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB successfully");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1); 
  }
};

connectToDatabase();

connectToDatabase();

// Middleware
app.use(express.json());
app.use(cors({ origin: "*" }));

// Helper functions for validation
const isEmailValid = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); // Simple regex for email validation
const isPasswordValid = (password) => password.length >= 6; // Password must be at least 6 characters

// Routes
app.get("/", (req, res) => {
  res.json({ data: "Hello, World!" });
});

// Create Account Route
app.post("/create-account", async (req, res) => {
  const { fullName, email, password } = req.body;

  if (!fullName || !email || !password) {
    return res.status(400).json({
      error: true,
      message: "Full Name, Email, and Password are required",
    });
  }

  if (!isEmailValid(email)) {
    return res
      .status(400)
      .json({ error: true, message: "Invalid email format" });
  }

  if (!isPasswordValid(password)) {
    return res.status(400).json({
      error: true,
      message: "Password must be at least 6 characters",
    });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: true, message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ fullName, email, password: hashedPassword });
    await newUser.save();

    const accessToken = jwt.sign(
      { userId: newUser._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "24h" }
    );

    res.status(201).json({
      error: false,
      message: "Registration successful",
      accessToken,
    });
  } catch (error) {
    console.error("Error creating account:", error);
    res.status(500).json({ error: true, message: "Internal server error" });
  }
});

// Login Route
app.post("/login", async (req, res) => {
  console.log("Request received:", req.body);
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: true,
      message: "Email and Password are required",
    });
  }

  if (!isEmailValid(email)) {
    return res
      .status(400)
      .json({ error: true, message: "Invalid email format" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: true, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ error: true, message: "Invalid credentials" });
    }

    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      error: false,
      message: "Login successful",
      accessToken,
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: true, message: "Internal server error" });
  }
});

// Get User Route
app.get("/get-user",authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const isUser = await User.findOne({_id: userId});
  if(!isUser){
    return res.status(401)
  }
  return res.json({
    user: {fullName: isUser.fullName, email: isUser.email, _id: isUser._id},
    message: "",createdOn: isUser.createdOn
  })

})

// Add Note Route
app.post("/add-note", authenticateToken, async (req, res) => {
  const { title, content, tags } = req.body;

  const userId = req.user.userId; // Extract userId from authenticated user

  if (!title) {
    return res.status(400).json({ error: true, message: "Title is required" });
  }

  if (!content) {
    return res
      .status(400)
      .json({ error: true, message: "Content is required" });
  }

  try {
    const note = new Note({
      title,
      content,
      tags: Array.isArray(tags) ? tags : [],
      userId,
    });

    await note.save();
    res.json({
      error: false,
      note,
      message: "Note added successfully",
    });
  } catch (error) {
    console.error("Error adding note:", error);
    res.status(500).json({ error: true, message: "Internal server error" });
  }
});

// Edit Note route
app.put("/edit-note/:note", authenticateToken, async (req, res) => {
  const noteId = req.params.note; // Corrected to match the route parameter
  const { title, content, tags, isPinned } = req.body;
  const userId = req.user.userId;

  if (!title && !content && !tags) {
    return res.status(400).json({
      error: true,
      message: "No changes provided",
    });
  }

  try {
    const note = await Note.findOne({ _id: noteId, userId });
    if (!note) {
      return res.status(404).json({ error: true, message: "Note not found" });
    }
    if (title) note.title = title;
    if (content) note.content = content;
    if (tags) note.tags = tags;
    if (isPinned !== undefined) note.isPinned = isPinned; // Explicitly check for undefined

    await note.save();

    return res.json({
      error: false,
      note,
      message: "Note updated successfully",
    });
  } catch (error) {
    console.error("Error updating note:", error); // Log the error for debugging
    return res.status(500).json({
      error: true,
      message: "Internal server error",
    });
  }
});

// Get all notes Route
app.get("/get-all-notes", authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  try {
    const notes = await Note.find({userId}).sort({isPinned:-1});
    return res.json({error:false,notes,message:"All notes retrieved successfully"});
  } catch (error) {
    console.error("Error updating note:", error); // Log the error for debugging
    return res.status(500).json({
      error: true,
      message: "Internal server error"
   })
  }
});

//Delete Note
app.delete("/delete-note/:noteId", authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const noteId = req.params.noteId;

  try {
    const note = await Note.findOne({ _id: noteId, userId });
    if (!note) {
      return res.status(400).json({ error: true, message: "Note Not Found" });
    }

    await Note.deleteOne({ _id: noteId, userId });
    return res.json({ error: false, message: "Note deleted successfully" });
  } catch (error) {
    console.error("Error deleting note:", error);
    return res.status(500).json({
      error: true,
      message: "Internal server error",
    });
  }
});

// Update IsPinned Value
app.put("/update-note-pinned/:noteId", authenticateToken, async (req, res) => {
  const noteId = req.params.noteId; // Corrected to match the route parameter
  const {isPinned } = req.body;
  const userId = req.user.userId;

  try {
    const note = await Note.findOne({ _id: noteId, userId });
    if (!note) {
      return res.status(404).json({ error: true, message: "Note not found" });
    }

    note.isPinned = isPinned ; 

    await note.save();

    return res.json({
      error: false,
      note,
      message: "Note updated successfully",
    });
  } catch (error) {
    console.error("Error updating note:", error); // Log the error for debugging
    return res.status(500).json({
      error: true,
      message: "Internal server error",
    });
  }
});

//Search Note
app.get("/search-notes/", authenticateToken, async (req, res) => {
  const userId = req.user.userId;
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: true, message: "Search query is required" });
  }

  try {

    const matchingNotes = await Note.find({
      userId,
      $or: [
        { title: { $regex: new RegExp(query, "i") } },
        { content: { $regex: new RegExp(query, "i") } }
      ]
    });

    if (matchingNotes.length === 0) {
      return res.status(404).json({ error: true, message: "No notes found matching the query" });
    }

    return res.json({
      error: false,
      notes: matchingNotes, // Return the found notes
      message: "Notes matching the search query retrieved successfully",
    });
  } catch (error) {
    console.error("Error searching notes:", error);
    return res.status(500).json({
      error: true,
      message: "Internal server error",
    });
  }
});


app.listen(process.env.PORT || 8000, () => {
  console.log("Server is running on port", process.env.PORT || 8000);
});

export default app;
