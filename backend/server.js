import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import postRoutes from "./routes/posts.js";
import commentRoutes from "./routes/comments.js";
import feedRoutes from "./routes/feed.js";
import notificationRoutes from "./routes/notifications.js";
import storyRoutes from "./routes/stories.js";
import messageRoutes from "./routes/messages.js";

dotenv.config();
const app = express();

/* ===== CORS (MUST BE FIRST) ===== */
app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://mini-insta-clone.vercel.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.options("*", (req, res) => {
  res.header("Access-Control-Allow-Origin", "https://mini-insta-clone.vercel.app");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,PATCH,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  return res.sendStatus(200);
});

/* ===== BODY PARSER ===== */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

/* ===== DB ===== */
connectDB();

/* ===== ROUTES ===== */
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/feed", feedRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/stories", storyRoutes);
app.use("/api/messages", messageRoutes);

app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, message: "Server is running" });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
