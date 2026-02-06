import jwt from "jsonwebtoken";
import User from "../models/User.js";

const httpError = (status, message) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

const signToken = (user) =>
  jwt.sign(
    {
      _id: user._id,
      role: user.role,
      buildingId: user.buildingId,
      buildingIds: user.buildingIds,
      unitId: user.unitId,
      leaseId: user.leaseId,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );

const cookieOptions = () => {
  const isProd = process.env.NODE_ENV === "production";
  const days = Number(process.env.COOKIE_EXPIRES_DAYS || 7);
  const sameSite =
    process.env.COOKIE_SAMESITE || (isProd ? "none" : "lax");
  const secure =
    process.env.COOKIE_SECURE === "true" || (sameSite === "none" ? true : isProd);
  return {
    httpOnly: true,
    sameSite,
    secure,
    maxAge: days * 24 * 60 * 60 * 1000,
  };
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) throw httpError(400, "Email and password required");

    const user = await User.findOne({ email }).select("+password");
    if (!user) throw httpError(401, "Invalid credentials");

    const match = await user.matchPassword(password);
    if (!match) throw httpError(401, "Invalid credentials");

    const token = signToken(user);
    res.cookie("token", token, cookieOptions());

    const safeUser = await User.findById(user._id).select("-password");
    res.json({ success: true, data: { user: safeUser } });
  } catch (err) {
    next(err);
  }
};

export const logout = async (_req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite:
      process.env.COOKIE_SAMESITE || (process.env.NODE_ENV === "production" ? "none" : "lax"),
    secure:
      process.env.COOKIE_SECURE === "true" ||
      (process.env.NODE_ENV === "production" ? true : false),
  });
  res.json({ success: true, data: { status: "ok" } });
};

export const me = async (req, res, next) => {
  try {
    if (!req.user) throw httpError(401, "Not authenticated");
    res.json({ success: true, data: { user: req.user } });
  } catch (err) {
    next(err);
  }
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password, role, buildingId, buildingIds, unitId, leaseId } =
      req.body || {};

    if (!email || !password) throw httpError(400, "Email and password required");
    if (!buildingId) throw httpError(400, "buildingId required");

    const existing = await User.findOne({ email });
    if (existing) throw httpError(409, "Email already in use");

    const user = await User.create({
      name,
      email,
      password,
      role: role || "resident",
      buildingId,
      buildingIds,
      unitId,
      leaseId,
    });

    const token = signToken(user);
    res.cookie("token", token, cookieOptions());

    const safeUser = await User.findById(user._id).select("-password");
    res.status(201).json({ success: true, data: { user: safeUser } });
  } catch (err) {
    next(err);
  }
};
