import mongoose from "mongoose";

const leaseSchema = new mongoose.Schema(
  {
    buildingId: { type: String, required: true, index: true },
    unitId: { type: mongoose.Schema.Types.ObjectId, ref: "Unit", index: true },
    residentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    status: {
      type: String,
      enum: ["active", "ended", "pending"],
      default: "pending",
      index: true,
    },
    terminationReason: { type: String },
    terminatedAt: { type: Date },
    terminatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    rentAmount: { type: Number },
    currency: { type: String, default: "USD" },
    document: {
      url: { type: String },
      fileName: { type: String },
      mimeType: { type: String },
      size: { type: Number },
      uploadedAt: { type: Date },
      uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
  },
  { timestamps: true }
);

leaseSchema.index({ buildingId: 1, status: 1 });
leaseSchema.index({ buildingId: 1, unitId: 1 });
leaseSchema.index({ buildingId: 1, residentId: 1 });

const Lease = mongoose.model("Lease", leaseSchema);

export default Lease;
