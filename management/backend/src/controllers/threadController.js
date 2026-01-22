import Message from "../models/Message.js";
import Thread from "../models/Thread.js";
import { tenantScope } from "../middleware/tenantScope.js";
import { fileToPublicPath } from "../config/multer.js";

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

export const listThreads = async (req, res, next) => {
  try {
    const filter = await tenantScope(req, {}, { action: "list_threads" });
    const threads = await Thread.find(filter).sort({
      lastMessageAt: -1,
      updatedAt: -1,
    });
    res.json({ success: true, data: threads });
  } catch (err) {
    next(err);
  }
};

export const listThreadMessages = async (req, res, next) => {
  try {
    const threadFilter = await tenantScope(req, {}, {
      action: "list_thread_messages",
    });

    const thread = await Thread.findOne({
      _id: req.params.id,
      ...threadFilter,
    });
    if (!thread) throw httpError(404, "Thread not found");

    const messages = await Message.find({
      buildingId: threadFilter.buildingId,
      threadId: thread._id,
    }).sort({ createdAt: 1 });

    res.json({ success: true, data: messages });
  } catch (err) {
    next(err);
  }
};

export const createThreadMessage = async (req, res, next) => {
  try {
    const { body } = req.body || {};
    if (!body) throw httpError(400, "Message body required");

    const threadFilter = await tenantScope(req, {}, {
      action: "create_thread_message",
    });

    const thread = await Thread.findOne({
      _id: req.params.id,
      ...threadFilter,
    });
    if (!thread) throw httpError(404, "Thread not found");

    const message = await Message.create({
      buildingId: threadFilter.buildingId,
      threadId: thread._id,
      senderId: req.user._id,
      body,
      attachments: toAttachments(req.files),
    });

    thread.lastMessageAt = new Date();
    await thread.save();

    res.status(201).json({ success: true, data: message });
  } catch (err) {
    next(err);
  }
};
