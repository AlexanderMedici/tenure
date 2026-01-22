import mongoose from "mongoose";

const buildingSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, unique: true, index: true },
    addressLine1: { type: String },
    addressLine2: { type: String },
    city: { type: String },
    state: { type: String },
    postalCode: { type: String },
    country: { type: String, default: "US" },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true,
    },
    managementIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

buildingSchema.index({ name: 1 });
buildingSchema.index({ status: 1, name: 1 });

const Building = mongoose.model("Building", buildingSchema);

export default Building;
