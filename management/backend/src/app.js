import express from "express";
import cors from "cors";
import path from "path";
import cookieParser from "cookie-parser";
import { protect } from "./middleware/protect.js";
import { requireRole } from "./middleware/requireRole.js";
import authRoutes from "./routes/authRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import announcementRoutes from "./routes/announcementRoutes.js";
import threadRoutes from "./routes/threadRoutes.js";
import invoiceRoutes from "./routes/invoiceRoutes.js";
import ticketRoutes from "./routes/ticketRoutes.js";
import buildingRoutes from "./routes/buildingRoutes.js";
import unitRoutes from "./routes/unitRoutes.js";
import leaseRoutes from "./routes/leaseRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import serviceAgentRoutes from "./routes/serviceAgentRoutes.js";
import communityRoutes from "./routes/communityRoutes.js";
import exportRoutes from "./routes/exportRoutes.js";

const app = express();

app.set("trust proxy", 1);

const rawOrigins = process.env.CLIENT_URL || "http://localhost:5173";
const allowedOrigins = rawOrigins
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/threads", threadRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/buildings", buildingRoutes);
app.use("/api/units", unitRoutes);
app.use("/api/leases", leaseRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/service-agents", serviceAgentRoutes);
app.use("/api/community", communityRoutes);
app.use("/api/admin/exports", exportRoutes);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/admin/health", protect, requireRole("admin"), (_req, res) => {
  res.json({ status: "ok", scope: "admin" });
});

app.use((err, _req, res, _next) => {
  const status = err.status || 500;
  res.status(status).json({
    message: err.message || "Server error",
  });
});

export default app;
