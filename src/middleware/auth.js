import jwt from "jsonwebtoken";
import { config } from "../config.js";
import { User } from "../models/User.js";

export async function authenticate(req, res, next) {
  const header = req.headers.authorization || "";
  const [, token] = header.split(" ");

  if (!token) {
    return res.status(401).json({ message: "Missing authorization token." });
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret);
    const user = await User.findById(payload.sub);
    if (!user) {
      return res.status(401).json({ message: "User not found." });
    }
    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}
