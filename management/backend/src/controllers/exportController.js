import PDFDocument from "pdfkit";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { tenantScope } from "../middleware/tenantScope.js";
import CommunityMessage from "../models/CommunityMessage.js";
import Message from "../models/Message.js";
import Thread from "../models/Thread.js";

const httpError = (status, message) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

const asTimestamp = (date) => new Date(date).toLocaleString();

const sendPdf = (res, title, rows) => {
  const doc = new PDFDocument({ margin: 40 });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${title}.pdf"`
  );
  doc.pipe(res);
  doc.fontSize(16).text(title, { underline: true });
  doc.moveDown();
  rows.forEach((row) => {
    doc.fontSize(10).text(`[${row.timestamp}] ${row.author}: ${row.body}`);
    doc.moveDown(0.5);
  });
  doc.end();
};

const sendDocx = async (res, title, rows) => {
  const paragraphs = [
    new Paragraph({
      children: [new TextRun({ text: title, bold: true, size: 28 })],
    }),
    new Paragraph(""),
    ...rows.map(
      (row) =>
        new Paragraph({
          children: [
            new TextRun({ text: `[${row.timestamp}] `, bold: true }),
            new TextRun({ text: `${row.author}: `, bold: true }),
            new TextRun(row.body),
          ],
        })
    ),
  ];

  const doc = new Document({
    sections: [{ properties: {}, children: paragraphs }],
  });

  const buffer = await Packer.toBuffer(doc);
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  );
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${title}.docx"`
  );
  res.send(buffer);
};

export const exportCommunity = async (req, res, next) => {
  try {
    const { format = "pdf" } = req.query;
    const filter = await tenantScope(req, {}, {
      action: "export_community",
      residentScoped: false,
    });

    const messages = await CommunityMessage.find(filter).sort({
      createdAt: 1,
    });

    const rows = messages.map((msg) => ({
      timestamp: asTimestamp(msg.createdAt),
      author: msg.senderName || "Member",
      body: msg.body,
    }));

    const title = `community-${filter.buildingId}`;

    if (format === "docx") {
      return sendDocx(res, title, rows);
    }
    return sendPdf(res, title, rows);
  } catch (err) {
    next(err);
  }
};

export const exportThread = async (req, res, next) => {
  try {
    const { format = "pdf" } = req.query;
    const filter = await tenantScope(req, {}, {
      action: "export_thread",
      residentScoped: false,
    });

    const thread = await Thread.findOne({
      _id: req.params.id,
      buildingId: filter.buildingId,
    });
    if (!thread) throw httpError(404, "Thread not found");

    const messages = await Message.find({
      buildingId: filter.buildingId,
      threadId: thread._id,
    }).sort({ createdAt: 1 });

    const rows = messages.map((msg) => ({
      timestamp: asTimestamp(msg.createdAt),
      author: String(msg.senderId),
      body: msg.body,
    }));

    const title = `thread-${thread._id}`;

    if (format === "docx") {
      return sendDocx(res, title, rows);
    }
    return sendPdf(res, title, rows);
  } catch (err) {
    next(err);
  }
};
