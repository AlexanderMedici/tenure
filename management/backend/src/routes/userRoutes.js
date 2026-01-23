import express from "express";
import {
  createUser,
  updateMe,
  uploadProfilePhoto,
} from "../controllers/userController.js";
import { protect } from "../middleware/protect.js";
import { requireRole } from "../middleware/requireRole.js";
import { uploadProfilePhoto as uploadProfilePhotoFile } from "../config/multer.js";

const router = express.Router();

router.post("/", protect, requireRole("management", "admin"), createUser);
router.post(
  "/me/photo",
  protect,
  requireRole("resident", "management", "admin"),
  uploadProfilePhotoFile.single("photo"),
  uploadProfilePhoto
);
router.patch("/me", protect, requireRole("resident", "management", "admin"), updateMe);

export default router;
