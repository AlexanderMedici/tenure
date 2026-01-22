import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema(
  {
    buildingId: { type: String, required: true, index: true },
    residentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    unitId: { type: mongoose.Schema.Types.ObjectId, ref: "Unit", index: true },
    leaseId: { type: mongoose.Schema.Types.ObjectId, ref: "Lease", index: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "USD" },
    dueDate: { type: Date, index: true },
    status: {
      type: String,
      enum: ["draft", "open", "paid", "overdue", "void"],
      default: "open",
      index: true,
    },
    lineItems: [
      {
        description: { type: String },
        amount: { type: Number, required: true },
      },
    ],
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

invoiceSchema.index({ buildingId: 1, status: 1, dueDate: 1 });
invoiceSchema.index({ buildingId: 1, residentId: 1, dueDate: -1 });

const Invoice = mongoose.model("Invoice", invoiceSchema);

export default Invoice;
