import Ticket from "../models/Ticket.js";
import { tenantScope } from "../middleware/tenantScope.js";
import { fileToPublicPath } from "../config/multer.js";
import ServiceAgent from "../models/ServiceAgent.js";
import { getMailer, getPreviewUrl } from "../utils/mailer.js";

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
    const filter = await tenantScope(req, {}, { action: "list_tickets" });
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

    const filter = await tenantScope(req, {}, { action: "create_ticket" });

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
      const transporter = await getMailer();
      const from = process.env.SMTP_FROM || "TENURE <no-reply@tenure.local>";
      const info = await transporter.sendMail({
        from,
        to: from,
        bcc: emails,
        subject: `[TENURE] New repair request: ${ticket.title}`,
        text: ticket.description || "New repair request submitted.",
        html: `<p>${ticket.description || "New repair request submitted."}</p>`,
        attachments: (req.files || []).map((file) => ({
          filename: file.originalname,
          path: file.path,
        })),
      });
      const previewUrl = getPreviewUrl(info);
      return res.status(201).json({
        success: true,
        data: ticket,
        meta: previewUrl ? { previewUrl } : undefined,
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
    const filter = await tenantScope(req, {}, { action: "update_ticket" });

    const ticket = await Ticket.findOneAndUpdate(
      { _id: id, ...filter },
      req.body,
      { new: true }
    );

    if (!ticket) throw httpError(404, "Ticket not found");

    res.json({ success: true, data: ticket });
  } catch (err) {
    next(err);
  }
};
