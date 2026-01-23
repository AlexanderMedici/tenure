import User from "../models/User.js";
import { tenantScope } from "../middleware/tenantScope.js";
import { fileToPublicPath } from "../config/multer.js";

const httpError = (status, message) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

export const createUser = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      role,
      buildingId,
      buildingIds,
      unitId,
      leaseId,
    } = req.body || {};

    if (!email || !password) throw httpError(400, "Email and password required");

    const filter = await tenantScope(req, {}, {
      action: "create_user",
      residentScoped: false,
    });

    const user = await User.create({
      name,
      email,
      password,
      role,
      buildingId: buildingId || filter.buildingId,
      buildingIds,
      unitId,
      leaseId,
    });

    const safeUser = await User.findById(user._id).select("-password");
    res.status(201).json({ success: true, data: safeUser });
  } catch (err) {
    next(err);
  }
};

export const uploadProfilePhoto = async (req, res, next) => {
  try {
    if (!req.user) throw httpError(401, "Not authenticated");
    if (!req.file) throw httpError(400, "Profile photo is required");

    const user = await User.findById(req.user._id).select("-password");
    if (!user) throw httpError(404, "User not found");

    user.profilePhoto = {
      url: fileToPublicPath(req.file),
      fileName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      uploadedAt: new Date(),
    };

    await user.save();
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

export const updateMe = async (req, res, next) => {
  try {
    if (!req.user) throw httpError(401, "Not authenticated");
    const { bio } = req.body || {};
    const user = await User.findById(req.user._id).select("-password");
    if (!user) throw httpError(404, "User not found");

    if (typeof bio === "string") {
      user.bio = bio;
    }

    await user.save();
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};
