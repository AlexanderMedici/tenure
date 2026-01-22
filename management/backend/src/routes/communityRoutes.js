import express from "express";
import { protect } from "../middleware/protect.js";
import {
  createCommunityMessage,
  listCommunityMessages,
} from "../controllers/communityController.js";
import fileUpload from "express-fileupload";

const router = express.Router();
const uploadMiddleware = fileUpload({
  limits: { fileSize: 5 * 1024 * 1024 },
  abortOnLimit: true,
  createParentPath: true,
});

router.get("/messages", protect, listCommunityMessages);
router.post("/messages", protect, uploadMiddleware, createCommunityMessage);

export default router;
