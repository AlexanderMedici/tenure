import "dotenv/config";
import http from "http";
import mongoose from "mongoose";
import { Server } from "socket.io";
import cookie from "cookie";
import jwt from "jsonwebtoken";
import app from "./app.js";
import User from "./models/User.js";
import Thread from "./models/Thread.js";
import Message from "./models/Message.js";
import CommunityMessage from "./models/CommunityMessage.js";

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "";
const rawOrigins = process.env.CLIENT_URL || "http://localhost:5173";
const allowedOrigins = rawOrigins
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const canAccessBuilding = (user, buildingId) => {
  if (user.role === "admin") return true;
  if (user.role === "management") {
    return (user.buildingIds || []).includes(buildingId);
  }
  if (user.role === "resident") {
    return user.buildingId === buildingId;
  }
  return false;
};

const canAccessThread = (user, thread, buildingId) => {
  if (!thread) return false;
  if (!canAccessBuilding(user, buildingId)) return false;
  if (user.role === "admin" || user.role === "management") return true;
  const residentId = String(thread.residentId || "");
  const unitId = String(thread.unitId || "");
  return (
    String(user._id) === residentId || (user.unitId && String(user.unitId) === unitId)
  );
};

const start = async () => {
  if (!MONGO_URI) {
    console.error("MONGO_URI missing in environment");
    process.exit(1);
  }

  await mongoose.connect(MONGO_URI);
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const cookies = cookie.parse(socket.request.headers.cookie || "");
      const token = cookies.token;
      if (!token) return next(new Error("Not authenticated"));
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(payload._id).select("-password");
      if (!user) return next(new Error("User not found"));
      socket.data.user = user;
      return next();
    } catch (err) {
      return next(new Error("Invalid token"));
    }
  });

  app.set("io", io);

  io.on("connection", (socket) => {
    const user = socket.data.user;
    if (user?._id) {
      socket.join(`user:${user._id}`);
    }

    socket.on("community:join", async ({ buildingId }) => {
      if (!buildingId || !canAccessBuilding(user, buildingId)) return;
      socket.join(`community:${buildingId}`);
    });

    socket.on("thread:join", async ({ threadId, buildingId }) => {
      if (!threadId || !buildingId) return;
      const thread = await Thread.findOne({
        _id: threadId,
        buildingId,
      });
      if (!canAccessThread(user, thread, buildingId)) return;
      socket.join(`thread:${threadId}`);
    });

    socket.on("community:message", async ({ buildingId, body }) => {
      if (!buildingId || !body || !canAccessBuilding(user, buildingId)) return;
      const message = await CommunityMessage.create({
        buildingId,
        senderId: user._id,
        senderName: user.name || user.email,
        body,
      });
      io.to(`community:${buildingId}`).emit("community:message", message);
    });

    socket.on("thread:message", async ({ threadId, buildingId, body }) => {
      if (!threadId || !buildingId || !body) return;
      const thread = await Thread.findOne({
        _id: threadId,
        buildingId,
      });
      if (!canAccessThread(user, thread, buildingId)) return;

      const message = await Message.create({
        buildingId,
        threadId,
        senderId: user._id,
        body,
      });
      thread.lastMessageAt = new Date();
      await thread.save();

      io.to(`thread:${threadId}`).emit("thread:message", message);
    });
  });

  server.listen(PORT, () => {
    console.log(`TENURE API listening on ${PORT}`);
  });
};

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
