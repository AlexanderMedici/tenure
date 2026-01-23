import express from "express";
import {
  createInvoice,
  deleteInvoice,
  downloadInvoice,
  listInvoices,
  updateInvoice,
} from "../controllers/invoiceController.js";
import { protect } from "../middleware/protect.js";
import { requireRole } from "../middleware/requireRole.js";
import fileUpload from "express-fileupload";

const router = express.Router();
const uploadMiddleware = fileUpload({
  limits: { fileSize: 10 * 1024 * 1024 },
  abortOnLimit: true,
  createParentPath: true,
});

router.get("/", protect, listInvoices);
router.get(
  "/:id/download",
  protect,
  requireRole("management", "admin"),
  downloadInvoice
);
router.post(
  "/",
  protect,
  requireRole("management", "admin"),
  uploadMiddleware,
  createInvoice
);
router.patch(
  "/:id",
  protect,
  requireRole("management", "admin"),
  uploadMiddleware,
  updateInvoice
);
router.delete(
  "/:id",
  protect,
  requireRole("management", "admin"),
  deleteInvoice
);

export default router;
