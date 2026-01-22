import mongoose from "mongoose";

const attachmentSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    fileName: { type: String },
    mimeType: { type: String },
    size: { type: Number },
  },
  { _id: false }
);

const messageSchema = new mongoose.Schema(
  {
    buildingId: { type: String, required: true, index: true },
    threadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Thread",
      required: true,
      index: true,
    },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    body: { type: String, required: true },
    attachments: [attachmentSchema],
  },
  { timestamps: true }
);

messageSchema.index({ buildingId: 1, threadId: 1, createdAt: 1 });
messageSchema.index({ buildingId: 1, senderId: 1, createdAt: -1 });

const Message = mongoose.model("Message", messageSchema);

export default Message;
