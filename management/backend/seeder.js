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

  const buildingKawa = await Building.create({
    name: "Kawa Haus",
    code: "KAWA-01",
    addressLine1: "220 Market Street",
    city: "San Francisco",
    state: "CA",
    postalCode: "94103",
  });

  const buildingValles = await Building.create({
    name: "Valles Haus",
    code: "VALLES-01",
    addressLine1: "415 Pine Street",
    city: "San Francisco",
    state: "CA",
    postalCode: "94104",
  });

  const makeUnits = (buildingId) => [
    { buildingId, number: "1A", floor: "1", status: "occupied" },
    { buildingId, number: "1B", floor: "1", status: "occupied" },
    { buildingId, number: "1C", floor: "1", status: "vacant" },
    { buildingId, number: "2A", floor: "2", status: "vacant" },
    { buildingId, number: "2B", floor: "2", status: "vacant" },
    { buildingId, number: "2C", floor: "2", status: "vacant" },
    { buildingId, number: "3A", floor: "3", status: "vacant" },
    { buildingId, number: "3B", floor: "3", status: "vacant" },
    { buildingId, number: "3C", floor: "3", status: "vacant" },
  ];

  const units = await Unit.insertMany(makeUnits(building._id.toString()));
  const kawaUnits = await Unit.insertMany(
    makeUnits(buildingKawa._id.toString())
  );
  const vallesUnits = await Unit.insertMany(
    makeUnits(buildingValles._id.toString())
  );

  const admin = await User.create({
    name: "Admin One",
    email: "admin@tenure.local",
    password: defaultPassword,
    role: "admin",
    buildingIds: [
      building._id.toString(),
      buildingKawa._id.toString(),
      buildingValles._id.toString(),
    ],
  });

  const management = await User.create({
    name: "Ava Manager",
    email: "manager@tenure.local",
    password: defaultPassword,
    role: "management",
    buildingIds: [
      building._id.toString(),
      buildingKawa._id.toString(),
      buildingValles._id.toString(),
    ],
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

  const residentThree = await User.create({
    name: "Liam Resident",
    email: "resident3@tenure.local",
    password: defaultPassword,
    role: "resident",
    buildingId: building._id.toString(),
    unitId: units[3]._id.toString(),
  });

  const residentFour = await User.create({
    name: "Emma Resident",
    email: "resident4@tenure.local",
    password: defaultPassword,
    role: "resident",
    buildingId: building._id.toString(),
    unitId: units[4]._id.toString(),
  });

  const residentKawa = await User.create({
    name: "Kawa Resident",
    email: "resident.kawa@tenure.local",
    password: defaultPassword,
    role: "resident",
    buildingId: buildingKawa._id.toString(),
    unitId: kawaUnits[0]._id.toString(),
  });

  const residentValles = await User.create({
    name: "Valles Resident",
    email: "resident.valles@tenure.local",
    password: defaultPassword,
    role: "resident",
    buildingId: buildingValles._id.toString(),
    unitId: vallesUnits[0]._id.toString(),
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

  const leaseTwo = await Lease.create({
    buildingId: building._id.toString(),
    unitId: units[3]._id,
    residentId: residentThree._id,
    startDate: new Date("2025-02-01"),
    endDate: new Date("2026-01-31"),
    status: "active",
    rentAmount: 3000,
  });

  const leaseThree = await Lease.create({
    buildingId: building._id.toString(),
    unitId: units[4]._id,
    residentId: residentFour._id,
    startDate: new Date("2025-03-01"),
    endDate: new Date("2026-02-28"),
    status: "active",
    rentAmount: 3100,
  });

  await User.updateOne(
    { _id: residentThree._id },
    { leaseId: leaseTwo._id.toString() }
  );
  await User.updateOne(
    { _id: residentFour._id },
    { leaseId: leaseThree._id.toString() }
  );

  const leaseKawa = await Lease.create({
    buildingId: buildingKawa._id.toString(),
    unitId: kawaUnits[0]._id,
    residentId: residentKawa._id,
    startDate: new Date("2025-02-01"),
    endDate: new Date("2026-01-31"),
    status: "active",
    rentAmount: 2800,
  });

  const leaseValles = await Lease.create({
    buildingId: buildingValles._id.toString(),
    unitId: vallesUnits[0]._id,
    residentId: residentValles._id,
    startDate: new Date("2025-03-01"),
    endDate: new Date("2026-02-28"),
    status: "active",
    rentAmount: 3000,
  });

  await User.updateOne(
    { _id: residentKawa._id },
    { leaseId: leaseKawa._id.toString() }
  );
  await User.updateOne(
    { _id: residentValles._id },
    { leaseId: leaseValles._id.toString() }
  );

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
