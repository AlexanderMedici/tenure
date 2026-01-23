import Lease from "../models/Lease.js";
import { tenantScope } from "../middleware/tenantScope.js";
import { fileToPublicPath } from "../config/multer.js";

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
    const filter = await tenantScope(req, {}, {
      action: "list_leases",
      leaseField: "_id",
    });
    const leases = await Lease.find(filter)
      .populate("unitId")
      .populate("residentId", "name email");
    res.json({ success: true, data: leases });
  } catch (err) {
    next(err);
  }
};

export const uploadLeaseDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      throw httpError(400, "Lease document is required");
    }

    const filter = await tenantScope(req, {}, {
      action: "upload_lease_document",
      leaseField: "_id",
    });

    const lease = await Lease.findOne(filter);
    if (!lease) {
      throw httpError(404, "Lease not found");
    }

    lease.document = {
      url: fileToPublicPath(req.file),
      fileName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      uploadedAt: new Date(),
      uploadedBy: req.user?._id,
    };

    await lease.save();
    res.status(200).json({ success: true, data: lease });
  } catch (err) {
    next(err);
  }
};
