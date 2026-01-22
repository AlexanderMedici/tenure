import express from "express";
import { createUnit } from "../controllers/unitController.js";
import { protect } from "../middleware/protect.js";
import { requireRole } from "../middleware/requireRole.js";

const router = express.Router();

router.post("/", protect, requireRole("management", "admin"), createUnit);

export default router;
