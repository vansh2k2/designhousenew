require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");

const connectDB = require("./src/config/db");

const authRoutes = require("./src/routes/auth.routes");
const adminRoutes = require("./src/routes/admin.routes");
const heroRoutes = require("./src/routes/hero.routes");
const clientRoutes = require("./src/routes/client.routes");

const errorHandler = require("./src/middleware/error.middleware");

const app = express();

// ✅ Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// ✅ Static uploads (for images)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Test route
app.get("/", (req, res) => {
  res.send("✅ Backend is running...");
});

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/hero", heroRoutes);
app.use("/api/client", clientRoutes);

// ✅ Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
});
