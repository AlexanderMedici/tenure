import User from "../models/User.js";
import { tenantScope } from "../middleware/tenantScope.js";

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
