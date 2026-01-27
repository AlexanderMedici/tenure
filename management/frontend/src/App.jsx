import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, ProtectedRoute } from "./app/auth";
import ResidentLayout from "./app/layouts/ResidentLayout";
import MgmtLayout from "./app/layouts/MgmtLayout";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import ResidentDashboard from "./pages/resident/Dashboard";

import ResidentPayments from "./pages/resident/Payments";
import ResidentRequests from "./pages/resident/Requests";
import ResidentRequestNew from "./pages/resident/RequestNew";
import ResidentAnnouncements from "./pages/resident/Announcements";
import ResidentProfile from "./pages/resident/Profile";
import ResidentCommunity from "./pages/resident/Community";
import ResidentLease from "./pages/resident/Lease";
import MgmtOverview from "./pages/mgmt/Overview";

import MgmtRequests from "./pages/mgmt/Requests";
import MgmtAnnouncements from "./pages/mgmt/Announcements";
import AnnouncementNew from "./pages/mgmt/AnnouncementNew";
import AnnouncementEdit from "./pages/mgmt/AnnouncementEdit";
import MgmtBilling from "./pages/mgmt/Billing";
import MgmtBuildings from "./pages/mgmt/Buildings";
import MgmtUsers from "./pages/mgmt/Users";
import ServiceAgents from "./pages/mgmt/ServiceAgents";
import MgmtCommunity from "./pages/mgmt/Community";
import MgmtLeases from "./pages/mgmt/Leases";
import MgmtProfile from "./pages/mgmt/Profile";
import AdminConsole from "./pages/admin/AdminConsole";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            element={
              <ProtectedRoute allowedRoles={["resident", "admin"]}>
                <ResidentLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<ResidentDashboard />} />

            <Route path="/payments" element={<ResidentPayments />} />
            <Route path="/requests" element={<ResidentRequests />} />
            <Route path="/requests/new" element={<ResidentRequestNew />} />
            <Route path="/announcements" element={<ResidentAnnouncements />} />
            <Route path="/profile" element={<ResidentProfile />} />
            <Route path="/community" element={<ResidentCommunity />} />
            <Route path="/lease" element={<ResidentLease />} />
          </Route>

          <Route
            element={
              <ProtectedRoute allowedRoles={["management", "admin"]}>
                <MgmtLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/mgmt" element={<MgmtOverview />} />

            <Route path="/mgmt/requests" element={<MgmtRequests />} />
            <Route path="/mgmt/announcements" element={<MgmtAnnouncements />} />
            <Route path="/mgmt/announcements/new" element={<AnnouncementNew />} />
            <Route
              path="/mgmt/announcements/:id/edit"
              element={<AnnouncementEdit />}
            />
            <Route path="/mgmt/billing" element={<MgmtBilling />} />
            <Route path="/mgmt/buildings" element={<MgmtBuildings />} />
            <Route path="/mgmt/users" element={<MgmtUsers />} />
            <Route path="/mgmt/service-agents" element={<ServiceAgents />} />
            <Route path="/mgmt/community" element={<MgmtCommunity />} />
            <Route path="/mgmt/leases" element={<MgmtLeases />} />
            <Route path="/mgmt/profile" element={<MgmtProfile />} />
          </Route>

          <Route
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <MgmtLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/admin" element={<AdminConsole />} />
          </Route>

          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
