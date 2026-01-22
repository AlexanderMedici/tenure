import mongoose from "mongoose";

const threadSchema = new mongoose.Schema(
  {
    buildingId: { type: String, required: true, index: true },
    subject: { type: String, trim: true },
    status: {
      type: String,
      enum: ["open", "closed", "pending"],
      default: "open",
      index: true,
    },
    residentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    unitId: { type: mongoose.Schema.Types.ObjectId, ref: "Unit", index: true },
    lastMessageAt: { type: Date, index: true },
  },
  { timestamps: true }
);

threadSchema.index({ buildingId: 1, status: 1, lastMessageAt: -1 });
threadSchema.index({ buildingId: 1, residentId: 1, lastMessageAt: -1 });

const Thread = mongoose.model("Thread", threadSchema);

export default Thread;
