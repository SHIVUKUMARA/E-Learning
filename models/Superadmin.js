const mongoose = require("mongoose");

const SuperadminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: "superadmin",
  },
});

module.exports = mongoose.model("Superadmin", SuperadminSchema);
