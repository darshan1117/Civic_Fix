# CivicFix — MERN Stack Civic Issue Reporting & Resolution Tracking Platform

[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose_8.4-47A248?logo=mongodb)](https://www.mongodb.com/)
[![Express.js](https://img.shields.io/badge/Express.js-4.19-black?logo=express)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js)](https://nodejs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Tests](https://img.shields.io/badge/Tests-13%20Passed-emerald)]()

**CivicFix** is a full-stack, deployable civic issue reporting and resolution-tracking web application built strictly using the **MERN Stack** (MongoDB, Express.js, React, Node.js) for an academic End-Term Software Engineering submission.

It eliminates uncoordinated civic reports, prevents duplicate filings within 50 meters, automatically routes reports to departmental queues, enforces statutory SLA countdowns, and mandates photo proof-of-fix verification.

---

## 1. System Architecture

CivicFix is organized as a clean **Client-Server Monorepo**:

```text
├── client/                     # Frontend (React 18, Vite, Tailwind CSS, Leaflet, Recharts)
│   ├── src/
│   │   ├── components/         # StatusBadge, SLABadge, UpvoteButton, LeafletMap, LocationPicker, Modals, Navbar
│   │   ├── context/            # AuthContext (JWT session, 1-Click Persona Switcher, Live Notifications)
│   │   ├── pages/              # Landing, Map, Report, IssueDetail, OfficerQueue, AdminDashboard, Hotspots, SLA
│   │   └── services/           # Axios API Client with JWT Interceptors
│   ├── vite.config.js          # Port 3000 with reverse proxy /api -> http://localhost:5000
│   └── package.json
│
├── server/                     # Backend API (Node.js, Express, Mongoose, JWT, Bcrypt)
│   ├── config/db.js            # MongoDB connection with zero-setup embedded fallback
│   ├── controllers/            # issueController, authController, statsController, cronController
│   ├── models/                 # User, Issue, Department, Category, SLARule, Notification
│   ├── routes/                 # Express REST API routes (/api/issues, /api/auth, /api/cron, etc.)
│   ├── seed/seeder.js          # Auto-seeder with 12 pre-configured Bengaluru issues & 6 personas
│   ├── utils/                  # haversine.js, stateMachine.js, priority.js, sla.js
│   ├── tests/                  # 13 Automated Node.js unit tests for core algorithms
│   └── server.js               # Express app entry on port 5000
│
├── .github/workflows/          # SLA auto-escalation cron action (runs every 15 mins)
├── package.json                # Root package with concurrently runner (`npm run dev`)
└── README.md
```

---

## 2. Target Users & Role-Based Access Control (RBAC)

The application features a **1-Click Persona Switcher** in the top navigation bar for immediate academic evaluation without manual login steps:

| Role | Persona Name | Email | Default Password | Primary Responsibilities |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | Aarav Sharma | `admin@civicfix.org` | `Password123!` | Municipal Commissioner: Analytics, SLA rules, Hotspot density, manual escalation sweeps |
| **Officer** | Priya Nair | `roads.officer@civicfix.org` | `Password123!` | Roads & Infrastructure Officer: Queue triage, field crew dispatch, proof-of-fix resolution |
| **Officer** | Rajesh Kumar | `sanitation.officer@civicfix.org` | `Password123!` | Solid Waste & Sanitation Officer: Garbage clearance & dump remediation |
| **Officer** | Kavita Reddy | `electricity.officer@civicfix.org` | `Password123!` | Electricity & Lighting Officer: Streetlight repair & outage handling |
| **Citizen** | Vikram Mehta | `citizen1@civicfix.org` | `Password123!` | Active Reporter: Geo-tagged reports, upvoting, 7-day dispute/closure confirmation |
| **Citizen** | Ananya Iyer | `citizen2@civicfix.org` | `Password123!` | Citizen: Upvotes and neighborhood issue tracking |

---

## 3. Four Core Workflows

### Workflow 1: Geo-Reporting with 50-Meter Duplicate Detection
1. Citizen opens `/report`, selects a category (*Pothole*, *Garbage*, *Streetlight*, *Water Leakage*, *Drainage*, *Other*).
2. Pinpoints the defect using browser GPS geolocation or dragging the interactive Leaflet map pin.
3. Uploads 1–3 photos (validated for JPG/PNG/WebP, ≤ 5MB).
4. **Spatial Duplicate Check**: Before database persistence, the Express backend computes Haversine spatial distances against all active open issues.
5. If an open issue of the same category exists within **50 meters**, a modal appears displaying the nearby issue's photo and distance. The citizen can either:
   - *"Upvote this existing issue instead"* (elevates priority without creating ticket clutter).
   - *"This is a different issue, submit anyway"*.
6. On submission, the backend auto-assigns the responsible municipal department, computes the initial priority score, schedules the SLA deadline, and assigns a trackable ticket ID (e.g. `CF-2026-00007`).

### Workflow 2: Pure Lifecycle State Machine
Enforced strictly on the server (`server/utils/stateMachine.js`) with zero illegal state jumps:
```text
Submitted ───► Acknowledged ───► In Progress ───► Resolved ───► Closed
    │               │                                │
    └───────► Rejected ◄─────────────────────────────┴────► Reopened (Dispute within 7 days)
```
- **Proof-of-Fix Requirement**: Transitioning an issue from `In Progress` to `Resolved` **strictly requires** uploading a repair photo and entering a resolution note.
- **7-Day Citizen Dispute Window**: Once resolved, the reporting citizen has a 7-day window to either click **Confirm Resolution & Close** or submit a reason to **Dispute & Reopen**.
- **Vertical Audit Trail**: Every single state change is recorded in the append-only `events` array with actor name, role, timestamp, and notes.

### Workflow 3: Live SLA Countdowns & Automated Escalation
- Each category has an SLA deadline (e.g., Water Leakage: 12h, Garbage: 24h, Drainage: 48h, Streetlight: 72h, Pothole: 120h).
- Officers see live countdown chips color-coded in real-time:
  - 🟢 **Safe**: > 50% time remaining.
  - 🟡 **Warning**: < 50% time remaining.
  - 🔴 **Overdue**: Breached deadline.
- **Automated Escalation Endpoint** (`/api/cron/escalate`):
  - Protected with `x-cron-secret` / `Bearer` token.
  - Idempotent: Can be triggered repeatedly without duplicate escalations.
  - Escalates breached issues: **Level 0 (Department) ➔ Level 1 (Department Head) ➔ Level 2 (City Commissioner)**.
  - Supported by `.github/workflows/escalate.yml` running every 15 minutes, plus a 1-click **"Run SLA Escalation Check Now"** button in `/admin`.
  - Demo evaluation mode supported: setting `SLA_TIME_UNIT=minutes` shrinks deadlines to minutes for rapid live presentations.

### Workflow 4: Admin Analytics & Hotspot Density Clustering
- `/admin` delivers executive KPIs:
  - Total Reports, Active Workload, Resolved Counts, SLA Compliance (%), Mean Resolution Time (hours), and Escalated Tickets.
  - **Recharts Visualizations**: Interactive department workload comparison and category proportion charts.
- `/admin/hotspots` renders an OpenStreetMap with:
  - Concentric hotspot rings highlighting high-risk zones (e.g., Koramangala, Indiranagar, Whitefield, HSR Layout).
  - Zone risk indicators (red for ≥ 3 open defects).
  - Interactive popup inspection linking directly to tickets.

---

## 4. Priority Formula

Dynamic issue ranking is calculated on every upvote and timeline event:
$$\text{Priority} = (\text{Upvotes} \times 2.5) + (\text{Age in Days} \times 1.5) + (\text{Category Severity} \times 3.0)$$

This guarantees safety-critical hazards (water leaks, open manholes) with heavy citizen upvotes automatically rise to the top of officer dispatch queues.

---

## 5. Getting Started & Local Setup

### Prerequisites
- Node.js version 18.0.0 or higher
- npm version 9.0.0 or higher

> **Zero Database Setup Required:**
> CivicFix includes an automated embedded database engine (`mongodb-memory-server`). If you do not have MongoDB running locally, the server automatically starts an in-memory database and pre-seeds it with realistic data on startup!
> If you have a local MongoDB (`mongodb://127.0.0.1:27017/civicfix`) or MongoDB Atlas URI, specify it in `server/.env` to use your persistent cluster.

### 1. Install All Dependencies
```bash
npm run install-all
```
*(This installs root, server, and client packages in one step).*

### 2. Run Automated Unit Tests
```bash
npm test
```
*Executes all 13 unit tests covering state machine transitions, 50m spatial Haversine calculations, SLA deadlines, and priority rankings.*

### 3. Launch Development Server
```bash
npm run dev
```
- Client runs at: **`http://localhost:3000`**
- Server runs at: **`http://localhost:5000`**
- API health check: **`http://localhost:5000/api/health`**

---

## 6. REST API Reference

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | Server health & uptime status |
| `POST` | `/api/auth/login` | Public | JWT login with email/password |
| `POST` | `/api/auth/register` | Public | Citizen account registration |
| `GET` | `/api/issues` | Public | List issues (filters: status, category, department, overdue, search) |
| `GET` | `/api/issues/:id` | Public | Fetch issue by MongoDB `_id` or public ID (`CF-YYYY-XXXXX`) |
| `POST` | `/api/issues/check-duplicates`| Public | Spatial 50m duplicate detection |
| `POST` | `/api/issues` | Protected | Submit new issue report |
| `PATCH`| `/api/issues/:id/status` | Protected | State machine transition (requires proof photo for `Resolved`) |
| `POST` | `/api/issues/:id/upvote` | Protected | Toggle citizen upvote (strictly 1 upvote per user) |
| `GET` | `/api/stats` | Public | Aggregated KPIs and Recharts chart datasets |
| `GET` | `/api/categories` | Public | List civic categories and severity weights |
| `GET` | `/api/departments` | Public | List municipal departments |
| `GET` | `/api/sla-rules` | Public | Fetch configured SLA turnaround hours |
| `PATCH`| `/api/sla-rules` | Admin | Update category SLA hours |
| `POST` | `/api/cron/escalate` | Cron / Admin | Idempotent SLA deadline breach check and auto-escalation |

---

## 7. Submission Checklist & Rubric Compliance

- [x] **Strict MERN Stack**: MongoDB (Mongoose), Express.js, React (Vite), Node.js.
- [x] **Authentication & RBAC**: JWT authorization with citizen, officer, and admin roles.
- [x] **Zero Mock Data**: Real database persistence, real REST endpoints, real mutations.
- [x] **50-Meter Duplicate Detection**: Server-side Haversine mathematical calculation with upvote redirect.
- [x] **Pure State Machine**: Formal transition validation, proof-of-fix photo mandate, 7-day dispute window.
- [x] **SLA Countdown & Escalation**: Live visual timers, idempotent `/api/cron/escalate`, GitHub Actions cron schedule.
- [x] **Data Visualizations**: Recharts department workload and category distributions.
- [x] **GIS Mapping**: Leaflet and OpenStreetMap integration with custom category markers and hotspot density rings.
- [x] **Unit Testing**: 13 automated tests covering business logic and calculations.
- [x] **Ready for Evaluation**: Pre-seeded demo personas and real Bengaluru civic dataset.
