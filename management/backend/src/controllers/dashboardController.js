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
        ? { ...buildingFilter, residentId: req.user._id }
        : buildingFilter;

    const announcementsFilter = { ...buildingFilter };
    if (req.user.role === "resident") {
      const now = new Date();
      announcementsFilter.status = "published";
      announcementsFilter.$or = [
        { publishAt: { $exists: false } },
        { publishAt: null },
        { publishAt: { $lte: now } },
      ];
    }

    const [announcements, threads, openTickets, openInvoices, recentAnnouncements] =
      await Promise.all([
        Announcement.countDocuments(announcementsFilter),
        Thread.countDocuments(residentFilter),
        Ticket.countDocuments({
          ...residentFilter,
          status: { $ne: "closed" },
        }),
        Invoice.countDocuments({
          ...residentFilter,
          status: { $in: ["open", "overdue"] },
        }),
        Announcement.find(announcementsFilter)
          .sort({ publishAt: -1, createdAt: -1 })
          .limit(3),
      ]);

    res.json({
      success: true,
      data: {
        announcements,
        threads,
        openTickets,
        openInvoices,
        recentAnnouncements,
      },
    });
  } catch (err) {
    next(err);
  }
};
