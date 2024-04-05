const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { sendEmail } = require("../utils/mail");
const { authenticateUser } = require("../middleware/auth");


// Course Enrollment
router.post("/:userId", authenticateUser, async (req, res) => {
  const { userId } = req.params;
  const { courseId } = req.body;

  try {
    console.log("Received courseId:", courseId);
    const user = await User.findOne({ _id: userId, role: "learner" }).populate(
      "enrolledCourses"
    );
    if (!user) {
      return res.status(404).json({ msg: "User not found or not authorized" });
    }

    if (!user.enrolledCourses || user.enrolledCourses.includes(courseId)) {
      return res
        .status(400)
        .json({ msg: "User is already enrolled in this course" });
    }

    user.enrolledCourses.push(courseId);
    await user.save();

    await sendEmail(
      user.email,
      "Course Enrollment",
      `You have successfully enrolled in the course: ${courseId}`
    );

    res.json({ msg: "User enrolled in the course successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});




// View Enrolled Courses
router.get("/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    const user = await User.findById(userId).populate("enrolledCourses");
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.json(user.enrolledCourses);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});


module.exports = router;
