import express from "express";
import {
  createThread,
  createThreadMessage,
  listThreadMessages,
  listThreads,
} from "../controllers/threadController.js";
import { protect } from "../middleware/protect.js";
import { uploadMessageAttachments } from "../config/multer.js";

const router = express.Router();

router.get("/", protect, listThreads);
router.post("/", protect, createThread);
router.get("/:id/messages", protect, listThreadMessages);
router.post(
  "/:id/messages",
  protect,
  uploadMessageAttachments.array("attachments", 5),
  createThreadMessage
);

export default router;
