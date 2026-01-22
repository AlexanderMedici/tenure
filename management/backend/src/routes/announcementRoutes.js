import express from "express";
import {
  createAnnouncement,
  listAnnouncements,
  updateAnnouncement,
} from "../controllers/announcementController.js";
import { protect } from "../middleware/protect.js";
import { requireRole } from "../middleware/requireRole.js";

const router = express.Router();

router.get("/", protect, listAnnouncements);
router.post("/", protect, requireRole("management", "admin"), createAnnouncement);
router.patch(
  "/:id",
  protect,
  requireRole("management", "admin"),
  updateAnnouncement
);

export default router;
