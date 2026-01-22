import ServiceAgent from "../models/ServiceAgent.js";
import { tenantScope } from "../middleware/tenantScope.js";

const httpError = (status, message) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

export const listServiceAgents = async (req, res, next) => {
  try {
    const filter = await tenantScope(req, {}, {
      action: "list_service_agents",
      residentScoped: false,
    });

    const { q, role, status } = req.query || {};
    const query = { ...filter };

    if (role) query.role = role;
    if (status) query.status = status;
    if (q) {
      const safe = String(q).trim();
      if (safe) {
        query.$or = [
          { name: new RegExp(safe, "i") },
          { email: new RegExp(safe, "i") },
          { phone: new RegExp(safe, "i") },
          { company: new RegExp(safe, "i") },
        ];
      }
    }

    const agents = await ServiceAgent.find(query).sort({
      status: 1,
      name: 1,
    });

    res.json({ success: true, data: agents });
  } catch (err) {
    next(err);
  }
};

export const createServiceAgent = async (req, res, next) => {
  try {
    const filter = await tenantScope(req, {}, {
      action: "create_service_agent",
      residentScoped: false,
    });

    const { name, role, email, phone, company, status, notes } = req.body || {};
    if (!name) throw httpError(400, "Name required");

    const agent = await ServiceAgent.create({
      ...filter,
      name,
      role,
      email,
      phone,
      company,
      status,
      notes,
    });

    res.status(201).json({ success: true, data: agent });
  } catch (err) {
    next(err);
  }
};

export const updateServiceAgent = async (req, res, next) => {
  try {
    const filter = await tenantScope(req, {}, {
      action: "update_service_agent",
      residentScoped: false,
    });

    const agent = await ServiceAgent.findOneAndUpdate(
      { _id: req.params.id, ...filter },
      req.body,
      { new: true }
    );

    if (!agent) throw httpError(404, "Service agent not found");

    res.json({ success: true, data: agent });
  } catch (err) {
    next(err);
  }
};

export const deleteServiceAgent = async (req, res, next) => {
  try {
    const filter = await tenantScope(req, {}, {
      action: "delete_service_agent",
      residentScoped: false,
    });

    const agent = await ServiceAgent.findOneAndDelete({
      _id: req.params.id,
      ...filter,
    });

    if (!agent) throw httpError(404, "Service agent not found");

    res.json({ success: true, data: { deleted: true } });
  } catch (err) {
    next(err);
  }
};
