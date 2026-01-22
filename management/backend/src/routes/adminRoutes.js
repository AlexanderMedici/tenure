import express from "express";
import { protect } from "../middleware/protect.js";
import { requireRole } from "../middleware/requireRole.js";
import {
  createAdminUser,
  deleteUser,
  listUsers,
  updateUser,
} from "../controllers/adminController.js";
import {
  deleteCommunityMessage,
  deleteThreadMessage,
} from "../controllers/adminChatController.js";

const router = express.Router();

router.use(protect, requireRole("admin"));

router.get("/users", listUsers);
router.post("/users", createAdminUser);
router.patch("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);
router.delete("/community/messages/:id", deleteCommunityMessage);
router.delete("/threads/:threadId/messages/:id", deleteThreadMessage);

export default router;
