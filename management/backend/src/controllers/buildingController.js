import Building from "../models/Building.js";

const httpError = (status, message) => {
  const err = new Error(message);
  err.status = status;
  return err;
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

    res.status(201).json({ success: true, data: building });
  } catch (err) {
    next(err);
  }
};
