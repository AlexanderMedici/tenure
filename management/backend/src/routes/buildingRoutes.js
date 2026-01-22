import express from "express";
import { createBuilding } from "../controllers/buildingController.js";
import { protect } from "../middleware/protect.js";
import { requireRole } from "../middleware/requireRole.js";

const router = express.Router();

router.post("/", protect, requireRole("management", "admin"), createBuilding);

export default router;
