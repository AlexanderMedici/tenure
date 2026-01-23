import Building from "../models/Building.js";
import User from "../models/User.js";

const httpError = (status, message) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

const getAllowedBuildings = (user) => {
  if (user.role === "admin") return null;
  if (user.role === "management") return user.buildingIds || [];
  return [];
};

export const createBuilding = async (req, res, next) => {
  try {
    const { name, code, addressLine1, addressLine2, city, state, postalCode } =
      req.body || {};
    if (!name) throw httpError(400, "Name required");

    const building = await Building.create({
      name,
      code,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
    });

    if (req.user?.role === "management") {
      await User.findByIdAndUpdate(req.user._id, {
        $addToSet: { buildingIds: String(building._id) },
      });
    }

    res.status(201).json({ success: true, data: building });
  } catch (err) {
    next(err);
  }
};

export const listBuildings = async (req, res, next) => {
  try {
    const allowed = getAllowedBuildings(req.user);
    const filter = allowed ? { _id: { $in: allowed } } : {};
    const buildings = await Building.find(filter).sort({ name: 1 });
    res.json({ success: true, data: buildings });
  } catch (err) {
    next(err);
  }
};

export const updateBuilding = async (req, res, next) => {
  try {
    const { id } = req.params;
    const allowed = getAllowedBuildings(req.user);
    if (Array.isArray(allowed) && !allowed.includes(id)) {
      throw httpError(403, "Building access denied");
    }
    const update = { ...req.body };
    const building = await Building.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });
    if (!building) throw httpError(404, "Building not found");
    res.json({ success: true, data: building });
  } catch (err) {
    next(err);
  }
};

export const deleteBuilding = async (req, res, next) => {
  try {
    const { id } = req.params;
    const allowed = getAllowedBuildings(req.user);
    if (Array.isArray(allowed) && !allowed.includes(id)) {
      throw httpError(403, "Building access denied");
    }
    const building = await Building.findByIdAndDelete(id);
    if (!building) throw httpError(404, "Building not found");
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
