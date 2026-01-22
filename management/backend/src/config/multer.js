import crypto from "crypto";
import fs from "fs";
import path from "path";
import multer from "multer";

const uploadsRoot = path.resolve(process.cwd(), "uploads");

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const sanitizeBaseName = (name) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "file";

const createUploader = ({ folder, allowed, maxSize }) => {
  const destination = path.join(uploadsRoot, folder);
  ensureDir(destination);

  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, destination),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const base = sanitizeBaseName(path.basename(file.originalname, ext));
      const safeExt = ext || "";
      const token = crypto.randomBytes(6).toString("hex");
      cb(null, `${Date.now()}-${token}-${base}${safeExt}`);
    },
  });

  const fileFilter = (_req, file, cb) => {
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Unsupported file type"));
    }
    return cb(null, true);
  };

  return multer({
    storage,
    fileFilter,
    limits: { fileSize: maxSize },
  });
};

export const uploadTicketPhotos = createUploader({
  folder: "tickets",
  allowed: ["image/jpeg", "image/png", "image/webp"],
  maxSize: 5 * 1024 * 1024,
});

export const uploadMessageAttachments = createUploader({
  folder: "messages",
  allowed: ["image/jpeg", "image/png", "image/webp", "application/pdf"],
  maxSize: 10 * 1024 * 1024,
});

export const uploadInvoiceAttachments = createUploader({
  folder: "invoices",
  allowed: ["image/jpeg", "image/png", "image/webp", "application/pdf"],
  maxSize: 10 * 1024 * 1024,
});

export const fileToPublicPath = (file) => {
  const relative = path
    .relative(uploadsRoot, file.path)
    .replace(/\\/g, "/");
  return `/uploads/${relative}`;
};
