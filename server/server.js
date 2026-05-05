const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const rateLimit = require("express-rate-limit");

dotenv.config();

const connectDB = require("./config/db");
const chatRoutes = require("./routes/chatRoutes");
const authRoutes = require("./routes/authRoutes"); // if you created auth
const authMiddleware = require("./middleware/authMiddleware"); // if you created auth

connectDB();

const app = express();

const allowedOrigins = [process.env.CLIENT_URL, "http://localhost:5173"];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 requests per minute per IP
  message: {
    error: "Too many requests, please try again in a moment.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.get("/", (req, res) => {
  res.send("Server is running");
});

// Auth routes (optional, if you've added them)
app.use("/api/auth", authRoutes);

// Protected & rate‑limited chat routes
app.use("/api/chat", authMiddleware, chatLimiter, chatRoutes);
// If you haven't added auth yet, temporarily use:
// app.use("/api/chat", chatLimiter, chatRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});