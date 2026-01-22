import jwt from "jsonwebtoken";
import User from "../models/User.js";

const httpError = (status, message) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

export const protect = async (req, _res, next) => {
  const token = req.cookies?.token;
  if (!token) return next(httpError(401, "Not authenticated"));

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload._id).select("-password");
    if (!user) return next(httpError(401, "User not found"));
    req.user = user;
    return next();
  } catch (_err) {
    return next(httpError(401, "Invalid or expired token"));
  }
};
