import Announcement from "../models/Announcement.js";
import Invoice from "../models/Invoice.js";
import Ticket from "../models/Ticket.js";
import Thread from "../models/Thread.js";
import { tenantScope } from "../middleware/tenantScope.js";

export const getDashboard = async (req, res, next) => {
  try {
    const buildingFilter = await tenantScope(req, {}, {
      action: "dashboard_building",
      residentScoped: false,
    });

    const residentFilter =
      req.user.role === "resident"
        ? await tenantScope(req, {}, { action: "dashboard_resident" })
        : buildingFilter;

    const [announcements, threads, openTickets, openInvoices] =
      await Promise.all([
        Announcement.countDocuments(buildingFilter),
        Thread.countDocuments(residentFilter),
        Ticket.countDocuments({
          ...residentFilter,
          status: { $ne: "closed" },
        }),
        Invoice.countDocuments({
          ...residentFilter,
          status: { $in: ["open", "overdue"] },
        }),
      ]);

    res.json({
      success: true,
      data: {
        announcements,
        threads,
        openTickets,
        openInvoices,
      },
    });
  } catch (err) {
    next(err);
  }
};
