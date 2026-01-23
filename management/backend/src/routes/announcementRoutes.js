import express from "express";
import {
  createAnnouncement,
  deleteAnnouncement,
  getAnnouncement,
  listAnnouncements,
  updateAnnouncement,
} from "../controllers/announcementController.js";
import { protect } from "../middleware/protect.js";
import { requireRole } from "../middleware/requireRole.js";

const router = express.Router();

router.get("/", protect, listAnnouncements);
router.post("/", protect, requireRole("management", "admin"), createAnnouncement);
router.get(
  "/:id",
  protect,
  requireRole("management", "admin"),
  getAnnouncement
);
router.patch(
  "/:id",
  protect,
  requireRole("management", "admin"),
  updateAnnouncement
);
router.delete(
  "/:id",
  protect,
  requireRole("management", "admin"),
  deleteAnnouncement
);

export default router;
