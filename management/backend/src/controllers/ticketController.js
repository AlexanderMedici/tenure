import Ticket from "../models/Ticket.js";
import { tenantScope } from "../middleware/tenantScope.js";
import { fileToPublicPath } from "../config/multer.js";
import ServiceAgent from "../models/ServiceAgent.js";
import { sendEmail } from "../utils/mailer.js";
import fs from "fs/promises";
import User from "../models/User.js";

const httpError = (status, message) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

const toAttachments = (files = []) =>
  files.map((file) => ({
    url: fileToPublicPath(file),
    fileName: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
  }));

export const listTickets = async (req, res, next) => {
  try {
    const filter = await tenantScope(req, {}, {
      action: "list_tickets",
      residentField: "residentId",
      unitField: "unitId",
      leaseField: "residentId",
    });
    const tickets = await Ticket.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: tickets });
  } catch (err) {
    next(err);
  }
};

export const createTicket = async (req, res, next) => {
  try {
    const { title, description, priority, dueDate, residentId, unitId } =
      req.body || {};
    if (!title) throw httpError(400, "Title required");

    const filter = await tenantScope(req, {}, {
      action: "create_ticket",
      residentField: "residentId",
      unitField: "unitId",
      leaseField: "residentId",
    });

    const payload = {
      ...filter,
      title,
      description,
      priority,
      dueDate,
      attachments: toAttachments(req.files),
    };

    if (req.user.role === "resident") {
      payload.residentId = req.user._id;
      payload.unitId = req.user.unitId;
    } else {
      payload.residentId = residentId;
      payload.unitId = unitId;
    }

    const ticket = await Ticket.create(payload);

    const agents = await ServiceAgent.find({
      buildingId: filter.buildingId,
      status: "active",
    }).select("email name");

    const emails = agents.map((a) => a.email).filter(Boolean);
    if (emails.length) {
      const from = process.env.RESEND_FROM || "no-reply@tenure.local";
      const attachments = await Promise.all(
        (req.files || []).map(async (file) => ({
          filename: file.originalname,
          content: (await fs.readFile(file.path)).toString("base64"),
        }))
      );
      await sendEmail({
        from,
        to: from,
        bcc: emails,
        subject: `[TENURE] New repair request: ${ticket.title}`,
        text: ticket.description || "New repair request submitted.",
        html: `<p>${ticket.description || "New repair request submitted."}</p>`,
        attachments,
      });
      return res.status(201).json({
        success: true,
        data: ticket,
      });
    }

    res.status(201).json({ success: true, data: ticket });
  } catch (err) {
    next(err);
  }
};

export const updateTicket = async (req, res, next) => {
  try {
    const { id } = req.params;
    const filter = await tenantScope(req, {}, {
      action: "update_ticket",
      residentField: "residentId",
      unitField: "unitId",
      leaseField: "residentId",
    });
    const existing = await Ticket.findOne({ _id: id, ...filter });
    if (!existing) throw httpError(404, "Ticket not found");

    const update = { ...req.body };
    if (update.assignedAgentId === "") {
      update.assignedAgentId = null;
      update.assignedAgentName = "";
    }
    const files = Array.isArray(req.files) ? req.files : req.files ? [req.files] : [];
    if (files.length) {
      const completionAttachments = toAttachments(files);
      update.$push = { completionAttachments: { $each: completionAttachments } };
    }

    if (update.assignedAgentId) {
      const agent = await ServiceAgent.findById(update.assignedAgentId);
      if (agent) {
        update.assignedAgentName = agent.name;
      }
    }

    if (
      update.status &&
      update.status !== existing.status &&
      (update.status === "resolved" || update.status === "closed")
    ) {
      update.completedAt = new Date();
      update.completedBy = req.user?._id;
    }

    const ticket = await Ticket.findOneAndUpdate(
      { _id: id, ...filter },
      update,
      { new: true }
    );

    if (!ticket) throw httpError(404, "Ticket not found");

    if (
      update.status &&
      update.status !== existing.status &&
      (update.status === "resolved" || update.status === "closed")
    ) {
      const resident = await User.findById(ticket.residentId).select("email name");
      if (resident?.email) {
        const from = process.env.RESEND_FROM || "no-reply@tenure.local";
        const agentLabel = ticket.assignedAgentName
          ? `Assigned agent: ${ticket.assignedAgentName}`
          : "Assigned agent: -";
        const completionLabel = ticket.completedAt
          ? `Completed: ${new Date(ticket.completedAt).toLocaleString()}`
          : "Completed";
        const attachmentLinks = (ticket.completionAttachments || [])
          .map((file) => `<li><a href="${file.url}">${file.fileName || "Attachment"}</a></li>`)
          .join("");
        const html = `
          <p>Your request has been completed.</p>
          <p><strong>${ticket.title}</strong></p>
          <p>${agentLabel}<br/>${completionLabel}</p>
          ${ticket.completionNotes ? `<p>Notes: ${ticket.completionNotes}</p>` : ""}
          ${
            attachmentLinks
              ? `<p>Completion attachments:</p><ul>${attachmentLinks}</ul>`
              : ""
          }
        `;
        await sendEmail({
          from,
          to: resident.email,
          subject: `[TENURE] Request completed: ${ticket.title}`,
          text: `Your request has been completed.\n${agentLabel}\n${completionLabel}`,
          html,
        });
      }

      const io = req.app?.get("io");
      if (io) {
        io.to(`user:${ticket.residentId}`).emit("ticket:completed", {
          ticketId: ticket._id,
          title: ticket.title,
          status: ticket.status,
        });
      }
    }

    res.json({ success: true, data: ticket });
  } catch (err) {
    next(err);
  }
};

export const deleteTicket = async (req, res, next) => {
  try {
    const { id } = req.params;
    const filter = await tenantScope(req, {}, {
      action: "delete_ticket",
      residentField: "residentId",
      unitField: "unitId",
      leaseField: "residentId",
    });
    const ticket = await Ticket.findOneAndDelete({ _id: id, ...filter });
    if (!ticket) throw httpError(404, "Ticket not found");
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
