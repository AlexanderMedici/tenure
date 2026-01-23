import express from "express";
import {
  createBuilding,
  deleteBuilding,
  listBuildings,
  updateBuilding,
} from "../controllers/buildingController.js";
import { protect } from "../middleware/protect.js";
import { requireRole } from "../middleware/requireRole.js";

const router = express.Router();

router.get("/", protect, requireRole("management", "admin"), listBuildings);
router.post("/", protect, requireRole("management", "admin"), createBuilding);
router.patch("/:id", protect, requireRole("management", "admin"), updateBuilding);
router.delete("/:id", protect, requireRole("management", "admin"), deleteBuilding);

export default router;
