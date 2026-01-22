import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    role: { type: String, index: true },
    action: { type: String, required: true, index: true },
    path: { type: String },
    buildingId: { type: String, index: true },
    ip: { type: String },
    userAgent: { type: String },
  },
  { timestamps: true }
);

auditLogSchema.index({ buildingId: 1, createdAt: -1 });
auditLogSchema.index({ userId: 1, createdAt: -1 });

const AuditLog = mongoose.model("AuditLog", auditLogSchema);

export default AuditLog;
