const express = require("express");
const router = express.Router();
const Course = require("../models/Course");

// Search courses by name
router.get("/", async (req, res) => {
  const { title } = req.query;

  try {
    const regex = new RegExp(title, "i");
    const courses = await Course.find({ title: regex });

    res.json(courses);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
