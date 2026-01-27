import Lease from "../models/Lease.js";
import Unit from "../models/Unit.js";
import User from "../models/User.js";
import { tenantScope } from "../middleware/tenantScope.js";
import { fileToPublicPath } from "../config/multer.js";

const httpError = (status, message) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

export const createLease = async (req, res, next) => {
  try {
    const { unitId, residentId, startDate, endDate, rentAmount, currency, status } =
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
      status,
    });

    await User.updateOne(
      { _id: residentId },
      { $set: { leaseId: lease._id.toString(), unitId: unitId } }
    );
    await Unit.updateOne({ _id: unitId }, { $set: { status: "occupied" } });

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
    const { leaseId } = req.body || {};
    if (!leaseId) {
      throw httpError(400, "leaseId is required");
    }

    const filter = await tenantScope(req, { _id: leaseId }, {
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

export const deleteLease = async (req, res, next) => {
  try {
    const { id } = req.params;
    const filter = await tenantScope(req, { _id: id }, {
      action: "delete_lease",
      leaseField: "_id",
    });
    const lease = await Lease.findOneAndDelete(filter);
    if (!lease) {
      throw httpError(404, "Lease not found");
    }
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

export const terminateLease = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body || {};
    const filter = await tenantScope(req, { _id: id }, {
      action: "terminate_lease",
      leaseField: "_id",
    });
    const lease = await Lease.findOne(filter);
    if (!lease) {
      throw httpError(404, "Lease not found");
    }
    lease.status = "ended";
    if (!lease.endDate) {
      lease.endDate = new Date();
    }
    if (reason) {
      lease.terminationReason = String(reason).trim();
    }
    lease.terminatedAt = new Date();
    lease.terminatedBy = req.user?._id;
    await lease.save();
    if (lease.residentId) {
      await User.updateOne(
        { _id: lease.residentId },
        { $unset: { leaseId: "" } }
      );
    }
    if (lease.unitId) {
      await Unit.updateOne(
        { _id: lease.unitId },
        { $set: { status: "vacant" } }
      );
    }
    res.json({ success: true, data: lease });
  } catch (err) {
    next(err);
  }
};
