import express from "express";
import { createUnit, listUnits } from "../controllers/unitController.js";
import { protect } from "../middleware/protect.js";
import { requireRole } from "../middleware/requireRole.js";

const router = express.Router();

router.get("/", protect, requireRole("management", "admin"), listUnits);
router.post("/", protect, requireRole("management", "admin"), createUnit);

export default router;
