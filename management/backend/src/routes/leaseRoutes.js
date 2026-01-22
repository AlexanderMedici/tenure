import express from "express";
import { createLease, listLeases } from "../controllers/leaseController.js";
import { protect } from "../middleware/protect.js";
import { requireRole } from "../middleware/requireRole.js";

const router = express.Router();

router.get("/", protect, listLeases);
router.post("/", protect, requireRole("management", "admin"), createLease);

export default router;
