import fs from "fs";
import path from "path";
import crypto from "crypto";

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

export const saveUpload = async (file, folder, allowed) => {
  if (!allowed.includes(file.mimetype)) {
    const err = new Error("Unsupported file type");
    err.status = 400;
    throw err;
  }

  const destination = path.join(uploadsRoot, folder);
  ensureDir(destination);

  const ext = path.extname(file.name).toLowerCase();
  const base = sanitizeBaseName(path.basename(file.name, ext));
  const token = crypto.randomBytes(6).toString("hex");
  const filename = `${Date.now()}-${token}-${base}${ext || ""}`;
  const fullPath = path.join(destination, filename);

  await file.mv(fullPath);

  const relative = path.relative(uploadsRoot, fullPath).replace(/\\/g, "/");
  return {
    url: `/uploads/${relative}`,
    fileName: file.name,
    mimeType: file.mimetype,
    size: file.size,
  };
};
