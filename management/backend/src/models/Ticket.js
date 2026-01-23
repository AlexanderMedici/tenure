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

const ticketSchema = new mongoose.Schema(
  {
    buildingId: { type: String, required: true, index: true },
    residentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    unitId: { type: mongoose.Schema.Types.ObjectId, ref: "Unit", index: true },
    title: { type: String, required: true },
    description: { type: String },
    assignedAgentId: { type: mongoose.Schema.Types.ObjectId, ref: "ServiceAgent" },
    assignedAgentName: { type: String },
    status: {
      type: String,
      enum: ["open", "in_progress", "resolved", "closed"],
      default: "open",
      index: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
      index: true,
    },
    attachments: [attachmentSchema],
    completionNotes: { type: String },
    completionAttachments: [attachmentSchema],
    completedAt: { type: Date },
    completedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    dueDate: { type: Date, index: true },
  },
  { timestamps: true }
);

ticketSchema.index({ buildingId: 1, status: 1, priority: 1, dueDate: 1 });
ticketSchema.index({ buildingId: 1, residentId: 1, status: 1 });

const Ticket = mongoose.model("Ticket", ticketSchema);

export default Ticket;
