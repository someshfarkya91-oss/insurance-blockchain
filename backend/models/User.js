// models/User.js
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username:      { type: String, required: true, unique: true },
  email:         { type: String, default: "" },
  mobile:        { type: String, default: "" },
  password:      { type: String, required: true },
  walletAddress: { type: String, default: null },
  role:          { type: String, enum: ["user", "admin"], default: "user" }, // ← THE FIX
});

module.exports = mongoose.model("User", UserSchema);