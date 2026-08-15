const express = require("express");
const Wish = require("../models/Wishes");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const wishes = await Wish.find().sort({ createdAt: -1 });

    res.json(wishes);
  } catch (error) {
    res.status(500).json({
      message: "Không thể lấy lời chúc",
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const { recipient, name, message } = req.body;

    const wish = new Wish({
      recipient,
      name,
      message,
    });

    await wish.save();

    res.status(201).json({
      message: "Đã gửi lời chúc",
      wish,
    });
  } catch (error) {
    res.status(500).json({
      message: "Không thể gửi lời chúc",
    });
  }
});

module.exports = router;
