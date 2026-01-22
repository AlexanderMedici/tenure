import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema(
  {
    buildingId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
      index: true,
    },
    publishAt: { type: Date },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

announcementSchema.index({ buildingId: 1, status: 1, publishAt: -1 });

const Announcement = mongoose.model("Announcement", announcementSchema);

export default Announcement;
