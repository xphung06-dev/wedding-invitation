const mongoose = require("mongoose");

const wishSchema = new mongoose.Schema(
  {
    recipient: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Wish", wishSchema);
