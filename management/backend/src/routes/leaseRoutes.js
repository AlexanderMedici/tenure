import express from "express";
import {
  createLease,
  deleteLease,
  listLeases,
  terminateLease,
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
router.patch(
  "/:id/terminate",
  protect,
  requireRole("management", "admin"),
  terminateLease
);
router.delete("/:id", protect, requireRole("management", "admin"), deleteLease);

export default router;
