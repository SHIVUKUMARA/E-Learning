const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const cloudinary = require("cloudinary").v2;
const User = require("../models/User");
const Superadmin = require("../models/Superadmin");
const { sendEmail } = require("../utils/mail");
const { authenticateUser } = require("../middleware/auth");

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// JWT Secret
const jwtSecret = process.env.JWT_SECRET;

// User Registration
router.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const existingSuperadmin = await Superadmin.findOne({ email });
    if (existingSuperadmin) {
      return res
        .status(400)
        .json({ msg: "Email already registered as superadmin" });
    }

    if (role === "superadmin") {
      const newSuperadmin = new Superadmin({ name, email, password });
      const salt = await bcrypt.genSalt(10);
      newSuperadmin.password = await bcrypt.hash(password, salt);
      await newSuperadmin.save();
    } else if (role === "learner") {
      const newUser = new User({ name, email, password });
      const salt = await bcrypt.genSalt(10);
      newUser.password = await bcrypt.hash(password, salt);
      await newUser.save();
    } else {
      return res.status(400).json({ msg: "Invalid role" });
    }
    await sendEmail(
      email,
      "Registration Confirmation",
      "Thank you for registering with our e-learning platform!"
    );

    res.json({ msg: "Registration successful" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// User Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    let user;
    user = await User.findOne({ email });
    if (!user) {
      user = await Superadmin.findOne({ email });
    }

    if (!user) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const payload = { user: { id: user.id, role: user.role } };
    jwt.sign(payload, jwtSecret, { expiresIn: "24h" }, async (err, token) => {
      if (err) throw err;
      await sendEmail(
        email,
        "Login Notification",
        "You have successfully logged in to our e-learning platform."
      );

      res.json({ token });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Forget Password - Send Reset Password Email
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    let user = await User.findOne({ email });
    if (!user) {
      user = await Superadmin.findOne({ email });
      if (!user) {
        return res.status(404).json({ msg: "User not found" });
      }
    }
    const payload = { user: { id: user.id } };
    jwt.sign(payload, jwtSecret, { expiresIn: "24h" }, async (err, token) => {
      if (err) throw err;

      const resetLink = `${req.protocol}://${req.get(
        "host"
      )}/reset-password/${token}`;
      await sendEmail(
        email,
        "Reset Your Password",
        `Please click the following link to reset your password: ${resetLink}`
      );

      res.json({ msg: "Password reset instructions sent to your email" });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// User Profile Update with Cloudinary integration
router.put("/profile/:id", authenticateUser, async (req, res) => {
  const userId = req.params.id;
  const { name, email, profilePicture } = req.body;

  try {
    let user = await User.findById(userId);
    if (!user) {
      user = await Superadmin.findById(userId);
      if (!user) {
        return res.status(404).json({ msg: "User not found" });
      }
    }

    const uploadedImage = await cloudinary.uploader.upload(profilePicture);

    user.name = name;
    user.email = email;
    user.profilePicture = uploadedImage.public_id;

    await user.save();
    await sendEmail(
      user.email,
      "Profile Updated",
      "Your profile information has been successfully updated."
    );

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Logout route
router.post("/logout/:id", authenticateUser, async (req, res) => {
  const userId = req.params.id;

  try {
    let user = await User.findById(userId);
    if (!user) {
      user = await Superadmin.findById(userId);
      if (!user) {
        return res.status(404).json({ msg: "User not found" });
      }
    }
    await sendEmail(
      user.email,
      "Logout Notification",
      "You have successfully logged out from our e-learning platform."
    );

    res.json({ msg: "Logout successful" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// delete user
router.delete("/profile/:id", async (req, res) => {
  const userId = req.params.id;

  try {
    let result = await User.deleteOne({ _id: userId });
    if (result.deletedCount === 0) {
      result = await Superadmin.deleteOne({ _id: userId });
      if (result.deletedCount === 0) {
        return res.status(404).json({ msg: "User not found" });
      }
    }

    res.json({ msg: "User account deleted successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
