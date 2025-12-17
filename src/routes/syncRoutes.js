import express from "express";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

router.use(authenticate);

router.post("/", async (req, res) => {
  const { values, timestamp } = req.body || {};
  const user = req.user;

  const serverTimestamp = user.syncData?.updatedAt || null;
  const serverValues = toPlainValues(user.syncData?.values);
  const clientTimestamp = parseTimestamp(timestamp);

  const serverNewer = Boolean(
    serverTimestamp && (!clientTimestamp || serverTimestamp.getTime() > clientTimestamp.getTime())
  );

  if (serverNewer) {
    return res.json({
      applied: "server",
      values: serverValues,
      timestamp: serverTimestamp.toISOString()
    });
  }

  if (!isPlainObject(values)) {
    return res.status(400).json({ message: "Values object is required." });
  }

  const sanitizedValues = sanitizeValues(values);

  user.syncData.values = sanitizedValues;
  user.syncData.updatedAt = new Date();

  await user.save();

  return res.json({
    applied: "client",
    timestamp: user.syncData.updatedAt.toISOString()
  });
});

function parseTimestamp(value) {
  if (!value) {
    return null;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed;
}

function isPlainObject(value) {
  return Boolean(
    value &&
    typeof value === "object" &&
    !Array.isArray(value)
  );
}

function sanitizeValues(values) {
  const result = new Map();
  for (const [key, value] of Object.entries(values)) {
    result.set(key, value);
  }
  return result;
}

function toPlainValues(values) {
  if (!values) {
    return {};
  }
  if (values instanceof Map) {
    return Object.fromEntries(values.entries());
  }
  if (Array.isArray(values)) {
    const result = Object.create(null);
    for (const entry of values) {
      if (Array.isArray(entry) && entry.length >= 2) {
        const [key, value] = entry;
        result[String(key)] = value;
      } else if (entry && typeof entry === "object" && "key" in entry) {
        result[String(entry.key)] = entry.value;
      }
    }
    return result;
  }
  if (typeof values === "object") {
    return { ...values };
  }
  return {};
}

export default router;
