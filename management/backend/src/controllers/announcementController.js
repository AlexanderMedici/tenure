import Announcement from "../models/Announcement.js";
import { tenantScope } from "../middleware/tenantScope.js";
import User from "../models/User.js";
import { getMailer, getPreviewUrl } from "../utils/mailer.js";

const httpError = (status, message) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

export const listAnnouncements = async (req, res, next) => {
  try {
    const filter = await tenantScope(req, {}, {
      action: "list_announcements",
      residentScoped: false,
    });
    const announcements = await Announcement.find(filter).sort({
      publishAt: -1,
      createdAt: -1,
    });
    res.json({ success: true, data: announcements });
  } catch (err) {
    next(err);
  }
};

export const createAnnouncement = async (req, res, next) => {
  try {
    const { title, body, status, publishAt, authorId } = req.body || {};
    if (!title || !body) throw httpError(400, "Title and body required");

    const filter = await tenantScope(req, {}, {
      action: "create_announcement",
      residentScoped: false,
    });

    const announcement = await Announcement.create({
      ...filter,
      title,
      body,
      status,
      publishAt,
      authorId: authorId || req.user._id,
    });

    const recipients = await User.find({
      role: "resident",
      buildingId: filter.buildingId,
    }).select("email name");

    if (recipients.length) {
      const transporter = await getMailer();
      const from = process.env.SMTP_FROM || "TENURE <no-reply@tenure.local>";
      const toList = recipients.map((u) => u.email).filter(Boolean);

      const info = await transporter.sendMail({
        from,
        to: from,
        bcc: toList,
        subject: `[TENURE] ${title}`,
        text: body,
        html: `<p>${body}</p>`,
      });

      const previewUrl = getPreviewUrl(info);
      return res.status(201).json({
        success: true,
        data: announcement,
        meta: previewUrl ? { previewUrl } : undefined,
      });
    }

    res.status(201).json({ success: true, data: announcement });
  } catch (err) {
    next(err);
  }
};

export const updateAnnouncement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const filter = await tenantScope(req, {}, {
      action: "update_announcement",
      residentScoped: false,
    });

    const announcement = await Announcement.findOneAndUpdate(
      { _id: id, ...filter },
      req.body,
      { new: true }
    );

    if (!announcement) throw httpError(404, "Announcement not found");

    res.json({ success: true, data: announcement });
  } catch (err) {
    next(err);
  }
};
