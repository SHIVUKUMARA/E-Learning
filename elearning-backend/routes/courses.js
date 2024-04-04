const express = require("express");
const router = express.Router();
const Course = require("../models/Course");
const { sendEmail } = require("../utils/mail");
const { authenticateUser, authorizeSuperadmin } = require("../middleware/auth");

// Get Courses with Filtering and Pagination
router.get("/", async (req, res) => {
  try {
    const { category, level, page, limit } = req.query;
    let query = {};

    if (category) query.category = category;
    if (level) query.level = level;

    const pageNumber = parseInt(page) || 1;
    const pageSize = parseInt(limit) || 10;

    const courses = await Course.find(query)
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize);

    res.json(courses);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// CRUD Operations for Superadmin
// Create Course
router.post("/", authenticateUser, authorizeSuperadmin, async (req, res) => {
  const { title, description, category, level } = req.body;

  try {
    const newCourse = new Course({ title, description, category, level });
    await newCourse.save();
    res.json(newCourse);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Read Course
router.get("/:id", async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ msg: "Course not found" });
    }
    res.json(course);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Update Course
router.put("/:id", authenticateUser, authorizeSuperadmin, async (req, res) => {
  const { title, description, category, level } = req.body;

  try {
    let course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ msg: "Course not found" });
    }
    course.title = title;
    course.description = description;
    course.category = category;
    course.level = level;
    await course.save();
    res.json(course);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Delete Course
router.delete(
  "/:id",
  authenticateUser,
  authorizeSuperadmin,
  async (req, res) => {
    try {
      const course = await Course.findById(req.params.id);
      if (!course) {
        return res.status(404).json({ msg: "Course not found" });
      }
      await course.deleteOne();
      res.json({ msg: "Course removed" });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

module.exports = router;
