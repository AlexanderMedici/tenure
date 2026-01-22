import mongoose from "mongoose";

const serviceAgentSchema = new mongoose.Schema(
  {
    buildingId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    role: {
      type: String,
      enum: ["plumber", "electrician", "handyman", "hvac", "cleaning", "other"],
      default: "other",
      index: true,
    },
    email: { type: String, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    company: { type: String, trim: true },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true,
    },
    notes: { type: String },
  },
  { timestamps: true }
);

serviceAgentSchema.index({ buildingId: 1, role: 1, status: 1 });

const ServiceAgent = mongoose.model("ServiceAgent", serviceAgentSchema);

export default ServiceAgent;
