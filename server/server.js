const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const rateLimit = require("express-rate-limit");

dotenv.config();

const connectDB = require("./config/db");
const chatRoutes = require("./routes/chatRoutes");
// const authRoutes = require("./routes/authRoutes");
// const authMiddleware = require("./middleware/authMiddleware");

connectDB();

const app = express();

const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Not allowed by CORS: ${origin}`));
      }
    },
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());

const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: {
    error: "Too many requests, please try again in a moment.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.get("/", (req, res) => {
  res.send("Server is running");
});

// app.use("/api/auth", authRoutes);

// keep auth off for now until everything is stable
app.use("/api/chat", chatLimiter, chatRoutes);

// later:
// app.use("/api/chat", authMiddleware, chatLimiter, chatRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});