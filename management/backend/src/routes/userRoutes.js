import express from "express";
import { createUser } from "../controllers/userController.js";
import { protect } from "../middleware/protect.js";
import { requireRole } from "../middleware/requireRole.js";

const router = express.Router();

router.post("/", protect, requireRole("management", "admin"), createUser);

export default router;
