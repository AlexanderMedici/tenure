import User from "../models/User.js";
import { tenantScope } from "../middleware/tenantScope.js";

const httpError = (status, message) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

const pick = (obj, keys) =>
  keys.reduce((acc, key) => {
    if (obj[key] !== undefined) acc[key] = obj[key];
    return acc;
  }, {});

export const listUsers = async (req, res, next) => {
  try {
    const filter = await tenantScope(req, {}, {
      action: "admin_list_users",
      residentScoped: false,
    });

    const role = req.query.role;
    const query = role ? { ...filter, role } : filter;
    const users = await User.find(query).select("-password").sort({ createdAt: -1 });

    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
};

export const createAdminUser = async (req, res, next) => {
  try {
    const filter = await tenantScope(req, {}, {
      action: "admin_create_user",
      residentScoped: false,
    });

    const { name, email, password } = req.body || {};
    if (!email || !password) throw httpError(400, "Email and password required");

    const existing = await User.findOne({ email });
    if (existing) throw httpError(409, "Email already in use");

    const user = await User.create({
      name,
      email,
      password,
      role: "admin",
      buildingId: filter.buildingId,
    });

    const safeUser = await User.findById(user._id).select("-password");
    res.status(201).json({ success: true, data: safeUser });
  } catch (err) {
    next(err);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const filter = await tenantScope(req, {}, {
      action: "admin_update_user",
      residentScoped: false,
    });

    const allowed = pick(req.body || {}, [
      "name",
      "role",
      "buildingId",
      "buildingIds",
      "unitId",
      "leaseId",
      "email",
    ]);

    const user = await User.findOneAndUpdate(
      { _id: req.params.id, ...filter },
      allowed,
      { new: true }
    ).select("-password");

    if (!user) throw httpError(404, "User not found");

    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const filter = await tenantScope(req, {}, {
      action: "admin_delete_user",
      residentScoped: false,
    });

    const user = await User.findOneAndDelete({ _id: req.params.id, ...filter });
    if (!user) throw httpError(404, "User not found");

    res.json({ success: true, data: { deleted: true } });
  } catch (err) {
    next(err);
  }
};
