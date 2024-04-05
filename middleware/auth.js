const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Superadmin = require("../models/Superadmin");

// Middleware to authenticate user using JWT token
const authenticateUser = async (req, res, next) => {
  try {
    const token = req.header("Authorization");
    if (!token) {
      return res
        .status(401)
        .json({ msg: "Authorization denied, token missing" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded.user;

    let user = await User.findById(req.user.id);
    if (!user) {
      user = await Superadmin.findById(req.user.id);
    }
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    next();
  } catch (err) {
    console.error(err.message);
    res.status(401).json({ msg: "Token is not valid" });
  }
};

// Middleware to authorize superadmin role
const authorizeSuperadmin = async (req, res, next) => {
  try {
    const { id, role } = req.user;

    if (role !== "superadmin") {
      return res.status(403).json({ msg: "Not authorized as a superadmin" });
    }

    const superadmin = await Superadmin.findById(id);
    if (!superadmin) {
      return res.status(404).json({ msg: "User not found" });
    }

    next();
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

module.exports = { authenticateUser, authorizeSuperadmin };
