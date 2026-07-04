import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { connectDatabase } from "./src/config/db.js";
import authRoutes from "./src/routes/authRoutes.js";
import restaurantRoutes from "./src/routes/restaurantRoutes.js";
import reviewRoutes from "./src/routes/reviewRoutes.js";
import reportRoutes from "./src/routes/reportRoutes.js";
import profileRoutes from "./src/routes/profileRoutes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true
  })
);
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "annapurna-api" });
});

app.use("/api/auth", authRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/profile", profileRoutes);

app.use((_req, res) => {
  res.status(404).json({ message: "Endpoint not found" });
});

await connectDatabase();

app.listen(port, () => {
  console.log(`Annapurna API running on http://localhost:${port}`);
});
