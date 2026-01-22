import mongoose from "mongoose";

const unitSchema = new mongoose.Schema(
  {
    buildingId: { type: String, required: true, index: true },
    number: { type: String, required: true },
    floor: { type: String },
    status: {
      type: String,
      enum: ["occupied", "vacant", "maintenance"],
      default: "vacant",
      index: true,
    },
    beds: { type: Number, default: 1 },
    baths: { type: Number, default: 1 },
    sizeSqft: { type: Number },
  },
  { timestamps: true }
);

unitSchema.index({ buildingId: 1, status: 1 });
unitSchema.index({ buildingId: 1, number: 1 }, { unique: true });

const Unit = mongoose.model("Unit", unitSchema);

export default Unit;
