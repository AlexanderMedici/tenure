import express from "express";
import {
  createTicket,
  listTickets,
  updateTicket,
} from "../controllers/ticketController.js";
import { protect } from "../middleware/protect.js";
import { requireRole } from "../middleware/requireRole.js";
import { uploadTicketPhotos } from "../config/multer.js";

const router = express.Router();

router.get("/", protect, listTickets);
router.post("/", protect, uploadTicketPhotos.array("photos", 5), createTicket);
router.patch(
  "/:id",
  protect,
  requireRole("management", "admin"),
  updateTicket
);

export default router;
