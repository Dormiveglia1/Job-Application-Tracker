import express from "express";
import cors from "cors";
import database from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

app.use("/api/applications", applicationRoutes);

app.use("/api/dashboard", dashboardRoutes);

app.get("/api/health", (request, response) => {
  response.status(200).json({
    message: "CareerFlow API is running",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/health/database", async (request, response) => {
  try {
    const [rows] = await database.query("SELECT 1 AS database_connected");

    response.status(200).json({
      message: "MySQL connection is working",
      database: process.env.DB_NAME,
      connected: rows[0].database_connected === 1,
    });
  } catch (error) {
    console.error("Database connection failed:", error.message);

    response.status(500).json({
      message: "Database connection failed",
    });
  }
});

app.listen(PORT, () => {
  console.log(`CareerFlow API is running on http://localhost:${PORT}`);
});
