import CommunityMessage from "../models/CommunityMessage.js";
import Message from "../models/Message.js";
import { tenantScope } from "../middleware/tenantScope.js";

const httpError = (status, message) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

export const deleteCommunityMessage = async (req, res, next) => {
  try {
    const filter = await tenantScope(req, {}, {
      action: "admin_delete_community_message",
      residentScoped: false,
    });

    const deleted = await CommunityMessage.findOneAndDelete({
      _id: req.params.id,
      buildingId: filter.buildingId,
    });

    if (!deleted) throw httpError(404, "Message not found");

    res.json({ success: true, data: { deleted: true } });
  } catch (err) {
    next(err);
  }
};

export const deleteThreadMessage = async (req, res, next) => {
  try {
    const filter = await tenantScope(req, {}, {
      action: "admin_delete_thread_message",
      residentScoped: false,
    });

    const deleted = await Message.findOneAndDelete({
      _id: req.params.id,
      threadId: req.params.threadId,
      buildingId: filter.buildingId,
    });

    if (!deleted) throw httpError(404, "Message not found");

    res.json({ success: true, data: { deleted: true } });
  } catch (err) {
    next(err);
  }
};
