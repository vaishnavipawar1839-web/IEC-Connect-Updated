import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";
import cookieParser from "cookie-parser";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import proposalRoutes from "./routes/proposalRoutes.js";
import reviewerRoutes from "./routes/reviewerRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import adminDataRoutes from "./routes/adminDataRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";

import scrutinyRoutes from "./routes/scrutinyRoutes.js";
import publicRoutes from "./routes/publicRoutes.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();


// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());

const allowedOrigin = process.env.ALLOWED_ORIGIN || "http://localhost:5173";

app.use(cors({
  origin: (origin, callback) => {
    const normalizedOrigin = origin ? origin.replace(/\/$/, "") : null;
    const normalizedAllowed = allowedOrigin ? allowedOrigin.replace(/\/$/, "") : null;

    const allowedList = [normalizedAllowed, "http://localhost:5173", "http://127.0.0.1:5173"];

    const isLocalhost = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(normalizedOrigin);

    if (!origin || allowedList.includes(normalizedOrigin) || isLocalhost) {
      callback(null, true);

    } else {
      console.log(`Blocked by CORS. Incoming: ${origin}, Allowed: ${allowedOrigin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization', 'X-Field-Path', 'X-File-Name']
}));

// Diagnostic / Health Check Routes
app.get("/", (req, res) => res.json({ message: "EthixPortal API is live", env: process.env.NODE_ENV }));
app.get("/api", (req, res) => res.json({ message: "API endpoint reachable" }));


app.use("/api/users", userRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/proposals", proposalRoutes);
app.use("/api/reviewer", reviewerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin-data", adminDataRoutes);
app.use("/api/documents", documentRoutes);

app.use("/api/scrutiny", scrutinyRoutes);
app.use("/api/public", publicRoutes);
const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log("MongoDB connected");
    console.log("Connected DB:", mongoose.connection.name);
    console.log("Host:", mongoose.connection.host);
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  });



