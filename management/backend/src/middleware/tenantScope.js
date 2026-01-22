import AuditLog from "../models/AuditLog.js";

const httpError = (status, message) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

const getBuildingId = (req) => {
  const buildingId =
    req.params?.buildingId || req.body?.buildingId || req.query?.buildingId;

  if (!buildingId) throw httpError(400, "buildingId is required");
  return buildingId;
};

const assertManagementAccess = (req, buildingId) => {
  const allowed = req.user?.buildingIds || [];
  if (!allowed.includes(buildingId)) {
    throw httpError(403, "Building access denied");
  }
};

const assertResidentAccess = (req, buildingId) => {
  const userBuildingId =
    req.user?.buildingId || req.user?.buildingIds?.[0] || null;
  if (userBuildingId && userBuildingId !== buildingId) {
    throw httpError(403, "Building access denied");
  }
};

const logAdminAccess = async (req, buildingId, action = "admin_access") => {
  await AuditLog.create({
    userId: req.user._id,
    role: req.user.role,
    action,
    path: req.originalUrl,
    buildingId,
    ip: req.ip,
    userAgent: req.get("user-agent"),
  });
};

export const tenantScope = async (req, baseFilter = {}, options = {}) => {
  if (!req.user) throw httpError(401, "Not authenticated");

  const buildingId = getBuildingId(req);
  const role = req.user.role;
  const { residentScoped = true } = options;

  const filter = { ...baseFilter, buildingId };

  if (role === "management") {
    assertManagementAccess(req, buildingId);
  } else if (role === "resident") {
    assertResidentAccess(req, buildingId);

    const {
      residentField = "residentId",
      unitField = "unitId",
      leaseField = "leaseId",
    } = options;

    if (residentScoped) {
      if (req.user.leaseId) {
        filter[leaseField] = req.user.leaseId;
      } else if (req.user.unitId) {
        filter[unitField] = req.user.unitId;
      } else if (req.user._id) {
        filter[residentField] = req.user._id;
      } else {
        throw httpError(403, "Resident scope missing");
      }
    }
  } else if (role === "admin") {
    const { action = "admin_access" } = options;
    await logAdminAccess(req, buildingId, action);
  } else {
    throw httpError(403, "Role not allowed");
  }

  return filter;
};

/*
Usage pattern in controllers (example):

export const listLeases = async (req, res, next) => {
  try {
    const filter = await tenantScope(req, {}, { leaseField: "leaseId" });
    const leases = await Lease.find(filter);
    res.json(leases);
  } catch (err) {
    next(err);
  }
};
*/
