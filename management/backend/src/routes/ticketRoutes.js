import express from "express";
import {
  createTicket,
  deleteTicket,
  listTickets,
  updateTicket,
} from "../controllers/ticketController.js";
import { protect } from "../middleware/protect.js";
import { requireRole } from "../middleware/requireRole.js";
import { uploadTicketPhotos, uploadTicketCompletion } from "../config/multer.js";

const router = express.Router();

router.get("/", protect, listTickets);
router.post("/", protect, uploadTicketPhotos.array("photos", 5), createTicket);
router.patch(
  "/:id",
  protect,
  requireRole("management", "admin"),
  uploadTicketCompletion.array("completionFiles", 3),
  updateTicket
);
router.delete(
  "/:id",
  protect,
  requireRole("management", "admin"),
  deleteTicket
);

export default router;
