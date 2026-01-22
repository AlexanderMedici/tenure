import "dotenv/config";
import mongoose from "mongoose";
import User from "./src/models/User.js";
import Building from "./src/models/Building.js";
import Unit from "./src/models/Unit.js";
import Lease from "./src/models/Lease.js";
import Thread from "./src/models/Thread.js";
import Message from "./src/models/Message.js";
import Invoice from "./src/models/Invoice.js";
import Ticket from "./src/models/Ticket.js";
import Announcement from "./src/models/Announcement.js";
import AuditLog from "./src/models/AuditLog.js";
import CommunityMessage from "./src/models/CommunityMessage.js";

const MONGO_URI = process.env.MONGO_URI || "";

const connectDb = async () => {
  if (!MONGO_URI) {
    throw new Error("MONGO_URI missing in environment");
  }
  await mongoose.connect(MONGO_URI);
};

const defaultPassword = "Tenure@123";

const seed = async () => {
  await connectDb();

  await Promise.all([
    AuditLog.deleteMany({}),
    CommunityMessage.deleteMany({}),
    Message.deleteMany({}),
    Thread.deleteMany({}),
    Ticket.deleteMany({}),
    Invoice.deleteMany({}),
    Lease.deleteMany({}),
    Unit.deleteMany({}),
    Building.deleteMany({}),
    User.deleteMany({}),
  ]);

  const building = await Building.create({
    name: "TENURE Residences",
    code: "TENURE-01",
    addressLine1: "1000 Grove Avenue",
    city: "San Francisco",
    state: "CA",
    postalCode: "94103",
  });

  const units = await Unit.insertMany([
    { buildingId: building._id.toString(), number: "1A", floor: "1", status: "occupied" },
    { buildingId: building._id.toString(), number: "1B", floor: "1", status: "occupied" },
    { buildingId: building._id.toString(), number: "2A", floor: "2", status: "vacant" },
    { buildingId: building._id.toString(), number: "2B", floor: "2", status: "vacant" },
    { buildingId: building._id.toString(), number: "PH1", floor: "PH", status: "maintenance" },
  ]);

  const admin = await User.create({
    name: "Admin One",
    email: "admin@tenure.local",
    password: defaultPassword,
    role: "admin",
    buildingIds: [building._id.toString()],
  });

  const management = await User.create({
    name: "Ava Manager",
    email: "manager@tenure.local",
    password: defaultPassword,
    role: "management",
    buildingIds: [building._id.toString()],
  });

  const residentOne = await User.create({
    name: "Noah Resident",
    email: "resident1@tenure.local",
    password: defaultPassword,
    role: "resident",
    buildingId: building._id.toString(),
    unitId: units[0]._id.toString(),
  });

  const residentTwo = await User.create({
    name: "Mia Resident",
    email: "resident2@tenure.local",
    password: defaultPassword,
    role: "resident",
    buildingId: building._id.toString(),
    unitId: units[1]._id.toString(),
  });

  const lease = await Lease.create({
    buildingId: building._id.toString(),
    unitId: units[0]._id,
    residentId: residentOne._id,
    startDate: new Date("2025-01-01"),
    endDate: new Date("2025-12-31"),
    status: "active",
    rentAmount: 3200,
  });

  await User.updateOne({ _id: residentOne._id }, { leaseId: lease._id.toString() });

  const thread = await Thread.create({
    buildingId: building._id.toString(),
    subject: "Lobby lighting update",
    status: "open",
    residentId: residentOne._id,
    unitId: units[0]._id,
    lastMessageAt: new Date(),
  });

  await Message.insertMany([
    {
      buildingId: building._id.toString(),
      threadId: thread._id,
      senderId: residentOne._id,
      body: "The lobby lights have been flickering since last night.",
    },
    {
      buildingId: building._id.toString(),
      threadId: thread._id,
      senderId: management._id,
      body: "Thanks for the heads up. Our team will review it today.",
    },
  ]);

  await CommunityMessage.insertMany([
    {
      buildingId: building._id.toString(),
      senderId: residentOne._id,
      senderName: residentOne.name,
      body: "Welcome to the TENURE community! Excited to be here.",
    },
    {
      buildingId: building._id.toString(),
      senderId: management._id,
      senderName: management.name,
      body: "Friendly reminder: rooftop lounge closes at 10pm.",
    },
    {
      buildingId: building._id.toString(),
      senderId: residentTwo._id,
      senderName: residentTwo.name,
      body: "Does anyone have a good moving company recommendation?",
    },
  ]);

  await Invoice.insertMany([
    {
      buildingId: building._id.toString(),
      residentId: residentOne._id,
      unitId: units[0]._id,
      leaseId: lease._id,
      amount: 3200,
      dueDate: new Date("2025-02-05"),
      status: "open",
    },
    {
      buildingId: building._id.toString(),
      residentId: residentOne._id,
      unitId: units[0]._id,
      leaseId: lease._id,
      amount: 3200,
      dueDate: new Date("2025-03-05"),
      status: "draft",
    },
  ]);

  await Ticket.insertMany([
    {
      buildingId: building._id.toString(),
      residentId: residentOne._id,
      unitId: units[0]._id,
      title: "AC leaking",
      description: "Noticed water dripping from the indoor unit.",
      status: "open",
      priority: "high",
      dueDate: new Date("2025-02-10"),
    },
    {
      buildingId: building._id.toString(),
      residentId: residentTwo._id,
      unitId: units[1]._id,
      title: "Window seal",
      description: "Draft coming from the bedroom window.",
      status: "in_progress",
      priority: "medium",
    },
  ]);

  await Announcement.insertMany([
    {
      buildingId: building._id.toString(),
      title: "Fitness studio refresh",
      body: "The fitness studio will be closed for upgrades this weekend.",
      status: "published",
      publishAt: new Date("2025-01-15"),
      authorId: management._id,
    },
    {
      buildingId: building._id.toString(),
      title: "Concierge hours",
      body: "Concierge desk now open daily from 7am to 10pm.",
      status: "published",
      publishAt: new Date("2025-01-10"),
      authorId: management._id,
    },
  ]);

  console.log("Seeded TENURE data.");
  await mongoose.disconnect();
};

const destroy = async () => {
  await connectDb();

  await Promise.all([
    AuditLog.deleteMany({}),
    CommunityMessage.deleteMany({}),
    Message.deleteMany({}),
    Thread.deleteMany({}),
    Ticket.deleteMany({}),
    Invoice.deleteMany({}),
    Lease.deleteMany({}),
    Unit.deleteMany({}),
    Building.deleteMany({}),
    User.deleteMany({}),
  ]);

  console.log("Destroyed TENURE data.");
  await mongoose.disconnect();
};

const mode = process.argv[2];

if (mode === "--import") {
  seed().catch((err) => {
    console.error(err);
    process.exit(1);
  });
} else if (mode === "--destroy") {
  destroy().catch((err) => {
    console.error(err);
    process.exit(1);
  });
} else {
  console.log("Usage: node seeder.js --import|--destroy");
}
