// index.js  –  ChainInsure Backend (fixed)
require("dotenv").config();
 
const cors      = require("cors");
const express   = require("express");
const mongoose  = require("mongoose");
const { ethers } = require("ethers");
const bcrypt    = require("bcryptjs");
const jwt       = require("jsonwebtoken");
const multer    = require("multer");
const path      = require("path");
const crypto    = require("crypto");
 
const User  = require("./models/User");
const Claim = require("./models/Claim");
const { authMiddleware, requireRole } = require("./middleware/auth");
 
const app    = express();
const SECRET = process.env.JWT_SECRET || "somesh_secret";
 
// ─────────────────────────────────────────────
// DATABASE
// ─────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/insuranceDB")
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("MongoDB error:", err));
 
// ─────────────────────────────────────────────
// MIDDLEWARE
// ─────────────────────────────────────────────
app.use(express.json());
app.use(cors({ origin: "*", exposedHeaders: ["Authorization"] }));
app.use("/uploads", express.static("uploads"));
 
// ─────────────────────────────────────────────
// FILE UPLOAD (multer)
// ─────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (_req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });
 
// ─────────────────────────────────────────────
// BLOCKCHAIN
// ─────────────────────────────────────────────
const provider = new ethers.JsonRpcProvider(
  process.env.RPC_URL || "http://127.0.0.1:8545"
);
const wallet = new ethers.Wallet(
  process.env.PRIVATE_KEY ||
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
  provider
);
const contractAddress =
  process.env.CONTRACT_ADDRESS ||
  "0x5FbDB2315678afecb367f032d93F642f64180aa3";
 
const abi = [
  {
    inputs: [{ internalType: "uint256", name: "index", type: "uint256" }],
    name: "approveClaim",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "string", name: "_reason", type: "string" }],
    name: "createClaim",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getClaims",
    outputs: [
      {
        components: [
          { internalType: "address", name: "user", type: "address" },
          { internalType: "string",  name: "reason", type: "string" },
          { internalType: "string",  name: "status", type: "string" },
        ],
        internalType: "struct Insurance.Claim[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];
 
const contract = new ethers.Contract(contractAddress, abi, wallet);
 
// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
 
// FIX: Always read role from DB, default to "user" only if undefined/null
const signToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role || "user" },
    SECRET,
    { expiresIn: "7d" }
  );
 
// In-memory nonce store  { address: nonce }
const nonceStore = new Map();
 
// ─────────────────────────────────────────────
// HEALTH
// ─────────────────────────────────────────────
app.get("/", (_req, res) => res.send("ChainInsure backend 🚀"));
 
// ─────────────────────────────────────────────
// AUTH — USERNAME / PASSWORD
// ─────────────────────────────────────────────
 
// POST /signup
app.post("/signup", async (req, res) => {
  try {
    const { username, email, mobile, password } = req.body;
    if (!username || !email || !mobile || !password)
      return res.status(400).json({ error: "All fields required" });
 
    if (await User.findOne({ username }))
      return res.status(400).json({ error: "User already exists" });
 
    const hashed = await bcrypt.hash(password, 10);
    const user   = await new User({ username, email, mobile, password: hashed }).save();
    res.json({ message: "User registered", token: signToken(user) });
  } catch (err) {
    console.error("SIGNUP ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});
 
// POST /login
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
 
    // FIX: Fetch the full user doc so role is always present
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ error: "User not found" });
 
    if (!(await bcrypt.compare(password, user.password)))
      return res.status(400).json({ error: "Wrong password" });
 
    const role = user.role || "user";
    console.log(`Login: ${username} → role: ${role}`); // debug
 
    res.json({ token: signToken(user), role });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});
 
// ─────────────────────────────────────────────
// GET /me  — returns current user info from JWT
// FIX: Frontend can call this to always get fresh role
// ─────────────────────────────────────────────
app.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id, "-password").lean();
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ ...user, role: user.role || "user" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});
 
// ─────────────────────────────────────────────
// AUTH — METAMASK (Sign-In with Ethereum)
// ─────────────────────────────────────────────
 
// Step 1 — GET /auth/nonce/:address
app.get("/auth/nonce/:address", (req, res) => {
  const address = req.params.address.toLowerCase();
  const nonce   = crypto.randomBytes(16).toString("hex");
  nonceStore.set(address, nonce);
  setTimeout(() => nonceStore.delete(address), 5 * 60 * 1000);
  res.json({
    message: `Sign this message to login to ChainInsure.\n\nNonce: ${nonce}`,
    nonce,
  });
});
 
// Step 2 — POST /auth/metamask
app.post("/auth/metamask", async (req, res) => {
  try {
    const { address, signature } = req.body;
    if (!address || !signature)
      return res.status(400).json({ error: "address and signature required" });
 
    const lc    = address.toLowerCase();
    const nonce = nonceStore.get(lc);
    if (!nonce) return res.status(400).json({ error: "Nonce expired — request a new one" });
 
    const message   = `Sign this message to login to ChainInsure.\n\nNonce: ${nonce}`;
    const recovered = ethers.verifyMessage(message, signature).toLowerCase();
 
    if (recovered !== lc)
      return res.status(401).json({ error: "Signature mismatch" });
 
    nonceStore.delete(lc);
 
    let user = await User.findOne({ walletAddress: lc });
    if (!user) {
      user = await new User({
        username:      `wallet_${lc.slice(2, 8)}`,
        walletAddress: lc,
        email:         `${lc.slice(2, 8)}@metamask.local`,
        mobile:        "0000000000",
        password:      await bcrypt.hash(crypto.randomBytes(16).toString("hex"), 10),
        role:          "user",
      }).save();
    }
 
    res.json({ token: signToken(user), role: user.role || "user", username: user.username });
  } catch (err) {
    console.error("METAMASK AUTH ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});
 
// ─────────────────────────────────────────────
// USER — UPDATE PASSWORD
// FIX: New endpoint for password changes from Settings page
// ─────────────────────────────────────────────
app.put("/user/password", authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ error: "Both current and new password are required" });
 
    if (newPassword.length < 6)
      return res.status(400).json({ error: "New password must be at least 6 characters" });
 
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });
 
    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) return res.status(400).json({ error: "Current password is incorrect" });
 
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
 
    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("PASSWORD CHANGE ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});
 
// ─────────────────────────────────────────────
// USER — UPDATE PROFILE (name/email)
// FIX: New endpoint for profile updates from Settings page
// ─────────────────────────────────────────────
app.put("/user/profile", authMiddleware, async (req, res) => {
  try {
    const { email } = req.body;
    const updates = {};
    if (email) updates.email = email;
 
    await User.findByIdAndUpdate(req.user.id, updates);
    res.json({ message: "Profile updated successfully" });
  } catch (err) {
    console.error("PROFILE UPDATE ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});
 
// ─────────────────────────────────────────────
// CLAIMS  (JWT protected)
// ─────────────────────────────────────────────
 
// POST /claim-with-image  — any logged-in user
app.post(
  "/claim-with-image",
  authMiddleware,
  upload.single("image"),
  async (req, res) => {
    try {
      const { reason } = req.body;
      const image      = req.file ? req.file.filename : null;
 
      const tx = await contract.createClaim(reason);
      await tx.wait();
 
      const claim = await new Claim({
        user:   wallet.address,
        userId: req.user.id,
        reason,
        image,
        status: "Pending",
      }).save();
 
      res.json({ message: "Claim submitted", claim });
    } catch (err) {
      console.error("CLAIM ERROR:", err);
      res.status(500).json({ error: "Error uploading claim" });
    }
  }
);
 
// GET /claims  — any logged-in user
app.get("/claims", authMiddleware, async (req, res) => {
  try {
    const filter =
      req.user.role === "admin" ? {} : { userId: req.user.id };
    const claims = await Claim.find(filter).sort({ createdAt: -1 });
    res.json(claims);
  } catch (err) {
    res.status(500).json({ error: "Error fetching claims" });
  }
});
 
// POST /approve  — admin only
app.post("/approve", authMiddleware, requireRole("admin"), async (req, res) => {
  try {
    const { index, claimId } = req.body;
 
    const tx = await contract.approveClaim(index);
    await tx.wait();
 
    if (claimId) {
      await Claim.findByIdAndUpdate(claimId, { status: "Approved" });
    }
 
    res.json({ message: "Claim approved" });
  } catch (err) {
    console.error("APPROVE ERROR:", err);
    res.status(500).json({ error: "Error approving claim" });
  }
});
 
// POST /reject  — admin only
app.post("/reject", authMiddleware, requireRole("admin"), async (req, res) => {
  try {
    const { claimId, reason } = req.body;
    await Claim.findByIdAndUpdate(claimId, {
      status: "Rejected",
      rejectionReason: reason || "Rejected by admin",
    });
    res.json({ message: "Claim rejected" });
  } catch (err) {
    res.status(500).json({ error: "Error rejecting claim" });
  }
});
 
// ─────────────────────────────────────────────
// ADMIN ROUTES
// ─────────────────────────────────────────────
 
// GET /admin/claims  — all claims with full details
app.get(
  "/admin/claims",
  authMiddleware,
  requireRole("admin"),
  async (_req, res) => {
    try {
      const claims = await Claim.find().sort({ createdAt: -1 }).lean();
      res.json(claims);
    } catch (err) {
      res.status(500).json({ error: "Error" });
    }
  }
);
 
// GET /admin/users  — list all users
app.get(
  "/admin/users",
  authMiddleware,
  requireRole("admin"),
  async (_req, res) => {
    try {
      const users = await User.find({}, "-password").lean();
      res.json(users);
    } catch (err) {
      res.status(500).json({ error: "Error" });
    }
  }
);
 
// PUT /admin/users/:id/role  — promote / demote
app.put(
  "/admin/users/:id/role",
  authMiddleware,
  requireRole("admin"),
  async (req, res) => {
    try {
      const { role } = req.body;
      if (!["user", "admin"].includes(role))
        return res.status(400).json({ error: "Invalid role" });
      await User.findByIdAndUpdate(req.params.id, { role });
      res.json({ message: "Role updated" });
    } catch (err) {
      res.status(500).json({ error: "Error" });
    }
  }
);
 
// DELETE /admin/claims  — clear all claim records (DB only)
app.delete(
  "/admin/claims",
  authMiddleware,
  requireRole("admin"),
  async (_req, res) => {
    try {
      await Claim.deleteMany({});
      res.json({ message: "All claims cleared" });
    } catch (err) {
      res.status(500).json({ error: "Error" });
    }
  }
);
 
// ─────────────────────────────────────────────
// START
// ─────────────────────────────────────────────
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));