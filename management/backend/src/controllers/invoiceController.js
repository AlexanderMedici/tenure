import Invoice from "../models/Invoice.js";
import { tenantScope } from "../middleware/tenantScope.js";
import { saveUpload } from "../utils/uploads.js";
import PDFDocument from "pdfkit";

const httpError = (status, message) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

export const listInvoices = async (req, res, next) => {
  try {
    const filter = await tenantScope(req, {}, { action: "list_invoices" });
    const invoices = await Invoice.find(filter).sort({ dueDate: 1 });
    res.json({ success: true, data: invoices });
  } catch (err) {
    next(err);
  }
};

export const createInvoice = async (req, res, next) => {
  try {
    const { amount, currency, dueDate, residentId, unitId, leaseId, lineItems } =
      req.body || {};
    if (!amount) throw httpError(400, "Amount required");

    const filter = await tenantScope(req, {}, { action: "create_invoice" });
    const allowed = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];
    const files = req.files?.attachments
      ? Array.isArray(req.files.attachments)
        ? req.files.attachments
        : [req.files.attachments]
      : [];
    const attachments = [];
    for (const file of files) {
      attachments.push(await saveUpload(file, "invoices", allowed));
    }

    const invoice = await Invoice.create({
      ...filter,
      amount,
      currency,
      dueDate,
      residentId,
      unitId,
      leaseId,
      lineItems,
      attachments,
    });

    res.status(201).json({ success: true, data: invoice });
  } catch (err) {
    next(err);
  }
};

export const updateInvoice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const filter = await tenantScope(req, {}, { action: "update_invoice" });
    const allowed = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];
    const files = req.files?.attachments
      ? Array.isArray(req.files.attachments)
        ? req.files.attachments
        : [req.files.attachments]
      : [];
    const attachments = [];
    for (const file of files) {
      attachments.push(await saveUpload(file, "invoices", allowed));
    }

    const update = { ...req.body };
    if (attachments.length) {
      update.$push = { attachments: { $each: attachments } };
    }

    const invoice = await Invoice.findOneAndUpdate(
      { _id: id, ...filter },
      update,
      { new: true }
    );

    if (!invoice) throw httpError(404, "Invoice not found");

    res.json({ success: true, data: invoice });
  } catch (err) {
    next(err);
  }
};

export const deleteInvoice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const filter = await tenantScope(req, {}, { action: "delete_invoice" });
    const invoice = await Invoice.findOneAndDelete({ _id: id, ...filter });
    if (!invoice) throw httpError(404, "Invoice not found");
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

const formatCurrency = (amount = 0, currency = "USD") => {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount);
  } catch (_err) {
    return `${amount} ${currency}`;
  }
};

export const downloadInvoice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const filter = await tenantScope(req, {}, { action: "download_invoice" });
    const invoice = await Invoice.findOne({ _id: id, ...filter });
    if (!invoice) throw httpError(404, "Invoice not found");

    const title = `Invoice ${invoice._id}`;
    const doc = new PDFDocument({ margin: 40 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="invoice-${invoice._id}.pdf"`
    );
    doc.pipe(res);
    doc.fontSize(16).text(title, { underline: true });
    doc.moveDown();
    doc.fontSize(10).text(`Status: ${invoice.status}`);
    doc.text(
      `Due: ${new Date(invoice.dueDate || invoice.createdAt).toLocaleDateString()}`
    );
    doc.text(
      `Amount: ${formatCurrency(invoice.amount, invoice.currency || "USD")}`
    );
    if (invoice.leaseId) doc.text(`Lease ID: ${invoice.leaseId}`);
    if (invoice.unitId) doc.text(`Unit ID: ${invoice.unitId}`);
    if (invoice.residentId) doc.text(`Resident ID: ${invoice.residentId}`);
    doc.moveDown();

    if (invoice.lineItems?.length) {
      doc.fontSize(12).text("Line items", { underline: true });
      doc.moveDown(0.5);
      invoice.lineItems.forEach((item) => {
        doc
          .fontSize(10)
          .text(
            `- ${item.description || "Item"}: ${formatCurrency(
              item.amount,
              invoice.currency || "USD"
            )}`
          );
      });
    }

    doc.end();
  } catch (err) {
    next(err);
  }
};
