import express from "express";
import {
  createLease,
  listLeases,
  uploadLeaseDocument,
} from "../controllers/leaseController.js";
import { protect } from "../middleware/protect.js";
import { requireRole } from "../middleware/requireRole.js";
import { uploadLeaseDocument as uploadLeaseDocumentFile } from "../config/multer.js";

const router = express.Router();

router.get("/", protect, listLeases);
router.post("/", protect, requireRole("management", "admin"), createLease);
router.post(
  "/document",
  protect,
  requireRole("management", "admin"),
  uploadLeaseDocumentFile.single("document"),
  uploadLeaseDocument
);

export default router;
