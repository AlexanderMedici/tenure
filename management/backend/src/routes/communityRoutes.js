import express from "express";
import { protect } from "../middleware/protect.js";
import {
  createCommunityMessage,
  deleteCommunityMessage,
  listCommunityMessages,
} from "../controllers/communityController.js";
import fileUpload from "express-fileupload";
import { requireRole } from "../middleware/requireRole.js";

const router = express.Router();
const uploadMiddleware = fileUpload({
  limits: { fileSize: 10 * 1024 * 1024 },
  abortOnLimit: true,
  createParentPath: true,
});

router.get("/messages", protect, listCommunityMessages);
router.post("/messages", protect, uploadMiddleware, createCommunityMessage);
router.delete(
  "/messages/:id",
  protect,
  requireRole("management", "admin"),
  deleteCommunityMessage
);

export default router;
