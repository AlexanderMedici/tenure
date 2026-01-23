import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ["resident", "management", "admin"],
      default: "resident",
    },
    buildingId: { type: String, index: true },
    buildingIds: [{ type: String, index: true }],
    unitId: { type: String },
    leaseId: { type: String },
    profilePhoto: {
      url: { type: String },
      fileName: { type: String },
      mimeType: { type: String },
      size: { type: Number },
      uploadedAt: { type: Date },
    },
    bio: { type: String, trim: true, maxlength: 500 },
  },
  { timestamps: true }
);

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  return next();
});

userSchema.methods.matchPassword = async function matchPassword(plain) {
  return bcrypt.compare(plain, this.password);
};

userSchema.index({ role: 1 });
userSchema.index({ buildingId: 1, role: 1 });
userSchema.index({ buildingIds: 1, role: 1 });

const User = mongoose.model("User", userSchema);

export default User;
