import express from "express";
import { protect } from "../middleware/protect.js";
import { requireRole } from "../middleware/requireRole.js";
import {
  createServiceAgent,
  deleteServiceAgent,
  listServiceAgents,
  updateServiceAgent,
} from "../controllers/serviceAgentController.js";

const router = express.Router();

router.use(protect, requireRole("management", "admin"));

router.get("/", listServiceAgents);
router.post("/", createServiceAgent);
router.patch("/:id", updateServiceAgent);
router.delete("/:id", deleteServiceAgent);

export default router;
