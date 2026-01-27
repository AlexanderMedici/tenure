import Unit from "../models/Unit.js";
import { tenantScope } from "../middleware/tenantScope.js";

const httpError = (status, message) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

export const createUnit = async (req, res, next) => {
  try {
    const { number, floor, status, beds, baths, sizeSqft } = req.body || {};
    if (!number) throw httpError(400, "Unit number required");

    const filter = await tenantScope(req, {}, { action: "create_unit" });

    const unit = await Unit.create({
      ...filter,
      number,
      floor,
      status,
      beds,
      baths,
      sizeSqft,
    });

    res.status(201).json({ success: true, data: unit });
  } catch (err) {
    next(err);
  }
};

export const listUnits = async (req, res, next) => {
  try {
    const filter = await tenantScope(req, {}, {
      action: "list_units",
      residentScoped: false,
    });
    const units = await Unit.find(filter).sort({ number: 1 });
    res.json({ success: true, data: units });
  } catch (err) {
    next(err);
  }
};
