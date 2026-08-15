const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const wishRoutes = require("./routes/wishRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/wishes", wishRoutes);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected");

    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });
