import CommunityMessage from "../models/CommunityMessage.js";
import { tenantScope } from "../middleware/tenantScope.js";
import { saveUpload } from "../utils/uploads.js";

const httpError = (status, message) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

export const listCommunityMessages = async (req, res, next) => {
  try {
    const filter = await tenantScope(req, {}, {
      action: "list_community_messages",
      residentScoped: false,
    });

    const messages = await CommunityMessage.find(filter)
      .sort({ createdAt: 1 })
      .limit(200);

    res.json({ success: true, data: messages });
  } catch (err) {
    next(err);
  }
};

export const createCommunityMessage = async (req, res, next) => {
  try {
    const { body } = req.body || {};
    if (!body) throw httpError(400, "Message body required");

    const filter = await tenantScope(req, {}, {
      action: "create_community_message",
      residentScoped: false,
    });

    const allowed = ["image/jpeg", "image/png", "image/webp"];
    const files = req.files?.photo
      ? Array.isArray(req.files.photo)
        ? req.files.photo
        : [req.files.photo]
      : [];
    const attachments = [];
    for (const file of files.slice(0, 1)) {
      attachments.push(await saveUpload(file, "community", allowed));
    }

    const message = await CommunityMessage.create({
      ...filter,
      senderId: req.user._id,
      senderName: req.user.name || req.user.email,
      body,
      attachments,
    });

    const io = req.app?.get("io");
    if (io) {
      io.to(`community:${filter.buildingId}`).emit("community:message", message);
    }

    res.status(201).json({ success: true, data: message });
  } catch (err) {
    next(err);
  }
};
