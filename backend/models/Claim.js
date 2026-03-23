// models/Claim.js
const mongoose = require("mongoose");
 
const ClaimSchema = new mongoose.Schema(
  {
    user:            { type: String },          // wallet address string
    userId:          { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reason:          { type: String, required: true },
    image:           { type: String },
    status:          { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
    rejectionReason: { type: String },
  },
  { timestamps: true }
);
 
module.exports = mongoose.model("Claim", ClaimSchema);