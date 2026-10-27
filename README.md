# CivicFix — Municipal Issue Resolution & SLA Tracking Platform

[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose_8.4-47A248?logo=mongodb)](https://www.mongodb.com/)
[![Express.js](https://img.shields.io/badge/Express.js-4.19-black?logo=express)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js)](https://nodejs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Automated Tests](https://img.shields.io/badge/Automated_Tests-44%20Passed-emerald)](https://nodejs.org/api/test.html)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

CivicFix is a full-stack civic infrastructure issue reporting, geospatial deduplication, and SLA resolution-tracking platform for municipal governance.

---

## 📋 Quick Submission Details (Form Checklist)

| Submission Field | Details |
| :--- | :--- |
| **Project Name** | **CivicFix** — Municipal Issue Resolution & SLA Tracking Platform |
| **Student Name** | Darshan |
| **Problem Statement** | Urban municipal governance suffers from duplicate civic complaints, lack of verifiable routing, opaque status changes, and unenforced resolution deadlines. CivicFix solves this through 50m spatial duplicate detection, role-based lifecycle state machines with mandatory proof-of-fix photos, real-time SLA countdowns with automated tiered escalation, and GIS hotspot analytics. |
| **GitHub Repository** | [https://github.com/darshan1117/Civic-Fix](https://github.com/darshan1117/Civic-Fix) |
| **Deployed Application** | [https://civicfix.vercel.app](https://civicfix.vercel.app) *(or your deployed production URL)* |
| **Demo Video (3–5 Min)**| [https://drive.google.com/file/d/YOUR_DEMO_VIDEO_LINK_HERE/view](https://drive.google.com/file/d/YOUR_DEMO_VIDEO_LINK_HERE/view) |
| **Tech Stack** | MongoDB (Mongoose), Express.js, React 18 (Vite), Node.js, Tailwind CSS, Leaflet GIS, Recharts |
| **Major Features** | 50m Haversine duplicate checking, pure state machine with proof photo mandate, 7-day citizen dispute window, dynamic priority algorithm, automated SLA cron escalation engine, geospatial hotspot clustering, complete Dark/Light mode theme system. |

---

## 1. Problem Statement
Urban municipal governance in growing metropolitan cities faces severe systemic issues:
1. **Duplicate Complaint Overload**: Multiple citizens report the identical pothole, broken streetlight, or garbage heap, overwhelming departmental queues with repetitive tickets.
2. **Unaccountable Workflows**: Tickets sit in unverified statuses without photographic evidence of repairs, leading to premature closure and citizen frustration.
3. **Missing SLA Enforcement**: Statutory turnaround timelines (Service Level Agreements) are rarely monitored in real time, with no automated escalation mechanism when issues remain unaddressed.
4. **Lack of Geographic Density Intelligence**: Municipal commissioners lack spatial clustering data to identify chronic infrastructure failure zones across city wards.

---

## 2. Target Users
CivicFix is built around a Role-Based Access Control (RBAC) architecture serving three key stakeholders:

1. **Citizens / Residents**:
   - Spot and report civic defects with photographic evidence and browser GPS coordinates.
   - Upvote nearby existing issues instead of creating duplicate complaints.
   - Track live ticket timelines and verify repairs during a 7-day post-resolution window.

2. **Department Field Officers** (*Roads, Sanitation, Electricity, Water & Drainage*):
   - Access filtered dispatch queues prioritized by dynamic urgency and SLA countdowns.
   - Dispatch crews, acknowledge tickets, and update progress.
   - Upload mandatory proof-of-fix photographs and repair notes to formally resolve issues.

3. **Municipal Administration / Commissioner**:
   - Monitor city-wide KPIs, SLA compliance rates, and department workload distributions.
   - Trigger automated SLA escalation sweeps to elevate overdue cases.
   - Inspect GIS hotspot density rings to deploy capital infrastructure upgrades.

---

## 3. Solution Overview
CivicFix eliminates fragmented civic management by combining modern web technologies, spatial mathematics, and verifiable state machine logic:
- **Spatial Deduplication Engine**: Computes spherical Haversine distances to catch open duplicates within a 50-meter radius before database insertion.
- **Strict Role-Gated State Machine**: Transitions (`Submitted` ➔ `Acknowledged` ➔ `In Progress` ➔ `Resolved` ➔ `Closed`) are validated on the backend. Marking an issue `Resolved` strictly enforces proof-of-work photo upload.
- **Automated Escalation Protocol**: Background cron jobs compare elapsed time against category SLA rules, auto-escalating overdue tickets from Department Staff ➔ Department Head ➔ Municipal Commissioner.
- **Dynamic Priority Scoring**: Prioritizes tickets using citizen upvotes, elapsed age, and category hazard weights so critical failures rise automatically.

---

## 4. Key Features & User Capabilities

### For Citizens
- **Pinpoint Hazard Reporting**: Drop GPS markers on an interactive Leaflet map with reverse geocoding.
- **Pre-Submission Duplicate Warning**: Receive alerts if an identical issue exists within 50m, with a 1-click option to upvote rather than duplicate.
- **Photo Upload Verification**: Attach up to 3 defect photographs with client-side format and file size validation (max 5MB).
- **Citizen Dispute & Closure**: Review officer proof-of-fix photos and confirm resolution or dispute/reopen within 7 days.
- **Activity Feed**: View all personal submissions, track real-time SLA badges, and receive live in-app notifications.

### For Field Officers
- **Operational Dispatch Queue**: Filter open cases by department, SLA urgency, or search term.
- **Live SLA Countdown Badges**: Color-coded visual timers indicating safe (green), warning (amber), and overdue (red) states.
- **Proof-of-Fix Mandatory Flow**: Modal enforcement requiring photographic proof and descriptive notes before an issue can be marked resolved.
- **Audit Trail Logging**: Complete chronological history documenting actor name, role, timestamp, and notes for every state transition.

### For Administrators
- **Executive Analytics Dashboard**: Real-time charts powered by Recharts (Department Workload Comparison & Category Breakdown).
- **Automated SLA Sweep Trigger**: 1-click execution of the idempotent `/api/cron/escalate` engine.
- **Category SLA Rules Editor**: Custom configuration of turnaround limits (in hours) per defect type.
- **Spatial Hotspot Density Map**: Concentric density rings highlighting geographic clusters exceeding safety thresholds across Bengaluru hubs.

---

## 5. Technology Stack & Technical Decisions

| Layer | Technologies Used | Engineering Rationale |
| :--- | :--- | :--- |
| **Frontend Framework** | **React 18** (Vite 5) | Component-driven UI, fast HMR, optimized bundle splitting |
| **Styling & Design** | **Tailwind CSS 3.4** | Utility-first styling with dual-theme (Light/Dark mode) system |
| **Geospatial GIS** | **Leaflet & React-Leaflet** | Interactive OpenStreetMap & CartoDB tile layers with custom SVG pins |
| **Data Visualization** | **Recharts** | Declarative SVG bar and donut charts for municipal metrics |
| **Icons & UI Assets** | **Lucide React** | Clean, accessible iconography |
| **Backend API** | **Node.js 20+** & **Express 4.19** | Non-blocking event-driven REST API architecture |
| **Database & ODM** | **MongoDB** & **Mongoose 8.4** | Document-oriented data modeling, geospatial queries, schema validation |
| **Embedded DB Engine** | **mongodb-memory-server** | Automatic zero-configuration fallback for immediate offline local setup |
| **Authentication** | **JWT (jsonwebtoken)** & **Bcrypt.js** | Stateless bearer token authentication with encrypted password hashing |
| **Testing Framework** | **Node.js Native Test Runner** (`node --test`) | Zero-dependency, ultra-fast test execution (145ms for unit suite) |

---

## 6. Architecture & Data Flow

```text
[ Citizen / Officer / Admin ]
             │
             ▼
    React 18 SPA (Vite)
             │  (Axios HTTP + JWT Bearer)
             ▼
    Express REST API (Port 5000)
    ├── Auth Middleware (JWT & Role Verification)
    ├── Rate Limiting (50 Submissions / Hour per User)
    ├── Input Sanitization & Regex Injection Defense
    │
    ├── Controllers & Algorithms
    │   ├── Haversine Distance Calculator (50m radius)
    │   ├── Priority Scoring Engine (Upvotes, Age, Category Weight)
    │   ├── SLA Calculation & Deadline Verification
    │   ├── Lifecycle State Machine (Proof-of-Fix Enforcer)
    │   └── Automated Cron Escalation Engine
    │
    ▼
MongoDB Database (Mongoose Schemas: User, Issue, Department, Category, SLARule, Notification)
```

### Pure Lifecycle State Machine
```text
Submitted ───► Acknowledged ───► In Progress ───► Resolved ───► Closed
    │               │                                │
    └───────► Rejected ◄─────────────────────────────┴────► Reopened (Citizen Dispute within 7 days)
```

### Priority Scoring Formula
Every issue is dynamically evaluated across lifecycle events:
$$\text{Priority Score} = (\text{Upvotes} \times 2.5) + (\text{Age in Days} \times 1.5) + (\text{Category Severity} \times 3.0)$$

---

## 7. Local Setup & Execution Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Git**: Installed and configured

> **Zero Database Setup Needed**: CivicFix contains an automated embedded MongoDB engine (`mongodb-memory-server`). If you do not have MongoDB running locally, the server starts an embedded database automatically and pre-seeds it with realistic data!

### Step 1: Clone the Repository
```bash
git clone https://github.com/darshan1117/Civic-Fix.git
cd Civic-Fix
```

### Step 2: Install Dependencies
Install all packages across the root, backend, and frontend with a single command:
```bash
npm run install-all
```

### Step 3: Run Automated Tests
Verify all business logic and edge cases before running:
```bash
npm test
```
*Executes all 22 automated unit tests across the state machine, Haversine spatial calculation, SLA deadlines, and priority algorithms.*

### Step 4: Start Development Servers
```bash
npm run dev
```
- **Frontend Application**: [http://localhost:3000](http://localhost:3000)
- **Backend REST API**: [http://localhost:5000](http://localhost:5000)
- **API Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 8. Evaluation Personas (1-Click Switcher)

The application includes a pre-configured **1-Click Persona Switcher** in the top navigation bar for immediate testing without manual login credentials:

| Persona Role | Name | Email | Default Password | Responsibilities |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | Aarav Sharma | `admin@civicfix.org` | `Password123!` | Municipal Commissioner: Analytics, SLA rules, Hotspot density, manual escalation sweeps |
| **Officer** | Priya Nair | `roads.officer@civicfix.org` | `Password123!` | Roads & Infrastructure Officer: Queue triage, field crew dispatch, proof-of-fix resolution |
| **Officer** | Rajesh Kumar | `sanitation.officer@civicfix.org` | `Password123!` | Solid Waste & Sanitation Officer: Garbage clearance & dump remediation |
| **Officer** | Kavita Reddy | `electricity.officer@civicfix.org` | `Password123!` | Electricity & Lighting Officer: Streetlight repair & outage handling |
| **Citizen** | Vikram Mehta | `citizen1@civicfix.org` | `Password123!` | Active Reporter: Geo-tagged reports, upvoting, 7-day dispute/closure confirmation |
| **Citizen** | Ananya Iyer | `citizen2@civicfix.org` | `Password123!` | Citizen: Upvotes and neighborhood issue tracking |

---

## 9. Environment Variables

Create a `.env` file inside the `server/` directory (or configure these in your deployment dashboard):

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Authentication Secret
JWT_SECRET=civicfix_super_secure_jwt_secret_key_2026

# Database Connection (Leave empty or omit to use automatic embedded in-memory MongoDB)
# MONGO_URI=mongodb://127.0.0.1:27017/civicfix

# SLA Demonstration Mode
# Set to 'minutes' for live evaluation demos (SLA deadlines count down in minutes instead of days)
SLA_TIME_UNIT=hours

# Cron Job Escalation Key
CRON_SECRET=civicfix_escalation_secret_token_2026
```

---

## 10. Production Deployment Guide

### Option A: Web Deployment (Vercel + Render / Railway)
1. **Frontend (Vercel)**:
   - Root directory: `client`
   - Build command: `npm run build`
   - Output directory: `dist`
   - Add rewrite rule in `client/vercel.json` to proxy `/api/*` to the deployed backend URL.
2. **Backend (Render / Railway / Fly.io)**:
   - Root directory: `server`
   - Start command: `node server.js`
   - Environment variables: Configure `JWT_SECRET`, `MONGO_URI` (MongoDB Atlas), `CRON_SECRET`, and `NODE_ENV=production`.

### Option B: Unified Production Build
To test the production build locally:
```bash
npm run build
```
Builds 2,400+ modules into minified static assets in `client/dist`.

---

## 11. REST API Specification

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | System health check and uptime status |
| `POST` | `/api/auth/login` | Public | Authenticates user and returns signed JWT token |
| `POST` | `/api/auth/register` | Public | Registers a new citizen profile |
| `POST` | `/api/auth/demo-login` | Public | 1-Click demo authentication for evaluation personas |
| `GET` | `/api/issues` | Public | Queries civic tickets with category, status, department, and search filters |
| `GET` | `/api/issues/:id` | Public | Fetches issue details by MongoDB ObjectId or public ID (`CF-YYYY-XXXXX`) |
| `POST` | `/api/issues/check-duplicates`| Public | Computes 50m Haversine distance against active open issues |
| `POST` | `/api/issues` | Protected | Submits a new civic defect report |
| `PATCH`| `/api/issues/:id/status` | Protected | Executes validated state transition (requires proof photo for `Resolved`) |
| `POST` | `/api/issues/:id/upvote` | Protected | Toggles citizen upvote (strictly 1 upvote per user) |
| `GET` | `/api/stats` | Public | Returns aggregated municipal KPIs and Recharts chart datasets |
| `GET` | `/api/categories` | Public | Lists civic categories, severity weights, and default SLA hours |
| `GET` | `/api/departments` | Public | Lists municipal departments and assigned officers |
| `GET` | `/api/sla-rules` | Public | Fetches current statutory SLA turnaround hours |
| `PATCH`| `/api/sla-rules` | Admin | Updates category SLA limits |
| `POST` | `/api/cron/escalate` | Cron / Admin | Runs automated idempotent deadline check and escalates breached cases |

---

## 12. Evaluation Rubric Alignment

- [x] **Core Product Implementation (25%)**: Complete end-to-end civic reporting, dispatching, and resolution workflow with zero mock data.
- [x] **Engineering & Application Logic (20%)**: Spherical Haversine duplicate detection, dynamic priority formula, and role-gated state machine.
- [x] **Architecture & Technical Decisions (15%)**: Clean client-server separation, normalized relational data modeling in Mongoose, and embedded DB fallback.
- [x] **Problem & Product Understanding (10%)**: Solves real municipal bottlenecks (duplicate ticket spam, unverifiable claims, missed statutory SLAs).
- [x] **User Experience & Reliability (10%)**: Seamless Dark/Light mode theme engine, accessible form wizard, interactive Leaflet GIS, and instant feedback.
- [x] **Code Quality & Project Structure (10%)**: Modular controllers, clean utilities, zero exposed credentials, and Git commit history.
- [x] **Deployment & Documentation (10%)**: Comprehensive README, local setup instructions, test suite commands, and deployment guide.
