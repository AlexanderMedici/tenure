import express from "express";
import { getDashboard } from "../controllers/dashboardController.js";
import { protect } from "../middleware/protect.js";

const router = express.Router();

router.get("/", protect, getDashboard);

export default router;
