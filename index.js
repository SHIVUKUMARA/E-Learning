require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const courseRoutes = require("./routes/courses");
const enrollRoutes = require("./routes/enrollment");
const searchRoutes = require("./routes/search");
const { authenticateUser } = require("./middleware/auth");

const app = express();
app.use(express.json());
app.use(cors());

// Database connection
const DB = process.env.DATABASE;
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Database Connected Successfully"))
  .catch((err) => console.error(err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/enrollment", enrollRoutes);
app.use("/api/search", searchRoutes);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
