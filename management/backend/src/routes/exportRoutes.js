import express from "express";
import { protect } from "../middleware/protect.js";
import { requireRole } from "../middleware/requireRole.js";
import { exportCommunity, exportThread } from "../controllers/exportController.js";

const router = express.Router();

router.use(protect, requireRole("admin"));

router.get("/community", exportCommunity);
router.get("/threads/:id", exportThread);

export default router;
