import express from "express";
import { login, logout, me, register } from "../controllers/authController.js";
import { protect } from "../middleware/protect.js";

const router = express.Router();

router.post("/login", login);
router.post("/logout", logout);
router.get("/me", protect, me);
router.post("/register", register);

export default router;
