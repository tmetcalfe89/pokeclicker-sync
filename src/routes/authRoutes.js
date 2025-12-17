import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { config } from "../config.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  try {
    const existing = await User.findOne({ username: username.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "Username already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, passwordHash });

    const token = createToken(user._id.toString());

    return res.status(201).json({
      token,
      user: user.toSafeJSON()
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to register user." });
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  try {
    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = createToken(user._id.toString());

    return res.json({
      token,
      user: user.toSafeJSON()
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to login." });
  }
});

router.get("/me", authenticate, (req, res) => {
  return res.json({
    user: req.user.toSafeJSON()
  });
});

function createToken(userId) {
  return jwt.sign({ sub: userId }, config.jwtSecret, { expiresIn: "7d" });
}

export default router;
