import Lease from "../models/Lease.js";
import { tenantScope } from "../middleware/tenantScope.js";

const httpError = (status, message) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

export const createLease = async (req, res, next) => {
  try {
    const { unitId, residentId, startDate, endDate, rentAmount, currency } =
      req.body || {};
    if (!unitId || !residentId || !startDate) {
      throw httpError(400, "Unit, resident, and startDate required");
    }

    const filter = await tenantScope(req, {}, { action: "create_lease" });

    const lease = await Lease.create({
      ...filter,
      unitId,
      residentId,
      startDate,
      endDate,
      rentAmount,
      currency,
    });

    res.status(201).json({ success: true, data: lease });
  } catch (err) {
    next(err);
  }
};

export const listLeases = async (req, res, next) => {
  try {
    const filter = await tenantScope(req, {}, { action: "list_leases" });
    const leases = await Lease.find(filter)
      .populate("unitId")
      .populate("residentId", "name email");
    res.json({ success: true, data: leases });
  } catch (err) {
    next(err);
  }
};
