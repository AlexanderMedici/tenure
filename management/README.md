# TENURE

Quiet‑luxury property operations for residents and management. TENURE is a web‑first MERN app with role‑based access, tenant scoping, real‑time messaging, and operational tooling for premium residential buildings.

## Tech Stack

![Vite](https://img.shields.io/badge/Vite-7.x-646CFF?logo=vite&logoColor=white)
![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react&logoColor=black)
![Tailwind](https://img.shields.io/badge/TailwindCSS-4.x-0F172A?logo=tailwindcss&logoColor=38BDF8)
![Express](https://img.shields.io/badge/Express-5.x-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-8.x-47A248?logo=mongodb&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4.x-010101?logo=socketdotio&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Auth-000000?logo=jsonwebtokens&logoColor=white)
![Nodemailer](https://img.shields.io/badge/Nodemailer-Email-22B573)

## What It Is

TENURE provides:
- Resident portal (messages, announcements, requests, payments, lease agreement)
- Management workspace (requests, billing, announcements, buildings, service agents)
- Admin console (user control, downloads, deletions)
- Real‑time messaging (direct threads + community chat)
- Secure tenant scoping by building

## Progress

Implemented:
- Monorepo structure (`/frontend`, `/backend`)
- JWT auth via httpOnly cookies
- Role‑based routing: resident, management, admin
- Tenant scoping on every query
- Mongoose models for core entities
- CRUD routes for tickets, invoices, announcements, threads, users, service agents
- Real‑time Socket.IO messaging with persistence
- Admin downloads (PDF/DOCX) + deletions for chats
- File uploads for requests, bills, community chat
- Email notifications (Ethereal test) for announcements + service agents
- Quiet‑luxury UI foundation + Tailwind v4 + shadcn/ui

## Folder Structure

```
backend/
  src/
    config/
    controllers/
    middleware/
    models/
    routes/
    utils/
  uploads/
frontend/
  src/
    app/
    components/
    pages/
    styles/
```

## Setup

### 1) Install dependencies

```
npm install
npm --prefix backend install
npm --prefix frontend install
```

### 2) Environment

Create `.env` in repo root and `backend/.env` (same values):

```
NODE_ENV=development
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
JWT_EXPIRES_IN=7d
COOKIE_EXPIRES_DAYS=7
CLIENT_URL=http://localhost:5173
COOKIE_SAMESITE=lax
COOKIE_SECURE=false
SMTP_FROM="TENURE <no-reply@tenure.local>"
```

### 3) Seed data

```
cd backend
npm run data:destroy
npm run data:import
```

Seeded accounts (all use `Tenure@123`):
- `admin@tenure.local`
- `manager@tenure.local`
- `resident1@tenure.local`
- `resident2@tenure.local`

### 4) Run the app

From repo root:

```
npm run dev
```

Or separately:

```
npm --prefix backend run dev
npm --prefix frontend run dev
```

## Key Routes

Frontend:
- `/login`, `/register`
- `/dashboard`, `/messages`, `/requests`, `/announcements`, `/payments`, `/lease`
- `/mgmt`, `/mgmt/requests`, `/mgmt/billing`, `/mgmt/service-agents`
- `/admin` (admin only)

Backend:
- `/api/auth/*`
- `/api/threads`, `/api/community/messages`
- `/api/announcements`, `/api/tickets`, `/api/invoices`, `/api/leases`
- `/api/admin/*`, `/api/admin/exports/*`

## Notes

- Vite proxies `/api` to `http://localhost:5000` in dev.
- Socket.IO uses the same httpOnly cookie for auth.
- All tenant data is scoped by `buildingId`.

## Render Deployment

This repo is a monorepo with a Node API and Vite frontend. Use the `render.yaml` blueprint at repo root.

Backend (Web Service):
- Root directory: `backend`
- Build command: `npm install`
- Start command: `npm run start`
- Env vars: `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`, `COOKIE_SAMESITE=none`, `COOKIE_SECURE=true`

Frontend (Static Site):
- Root directory: `frontend`
- Build command: `npm install && npm run build`
- Publish directory: `dist`
- Env vars: `VITE_API_URL` and `VITE_SOCKET_URL` set to your backend URL
