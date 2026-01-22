import mongoose from "mongoose";

const communityMessageSchema = new mongoose.Schema(
  {
    buildingId: { type: String, required: true, index: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    senderName: { type: String },
    body: { type: String, required: true },
    attachments: [
      {
        url: { type: String, required: true },
        fileName: { type: String },
        mimeType: { type: String },
        size: { type: Number },
      },
    ],
  },
  { timestamps: true }
);

communityMessageSchema.index({ buildingId: 1, createdAt: -1 });

const CommunityMessage = mongoose.model(
  "CommunityMessage",
  communityMessageSchema
);

export default CommunityMessage;
