# Project Name

**CivicFix** - Municipal Issue Resolution & SLA Tracking Platform

---

## Problem Statement

**What problem are you solving?**

Urban municipal governance in growing metropolitan cities faces severe systemic issues:
1. **Duplicate Complaint Overload**: Multiple citizens report the identical pothole, broken streetlight, or garbage heap, overwhelming departmental queues with repetitive tickets and wasting municipal resources.
2. **Unaccountable Workflows**: Tickets sit in unverified statuses without photographic evidence of repairs, leading to premature ticket closure and citizen distrust.
3. **Missing SLA Enforcement**: Statutory turnaround timelines (Service Level Agreements) are rarely monitored in real time, with no automated escalation mechanism when issues remain unaddressed.
4. **Lack of Geographic Density Intelligence**: Municipal commissioners lack spatial clustering data to identify chronic infrastructure failure zones across city wards.

---

## Target Users

**Who is the application built for?**

CivicFix is designed around Role-Based Access Control (RBAC) serving three key user groups:

1. **Citizens / Residents**:
   - Report civic defects with photos and browser GPS coordinates.
   - Discover nearby existing issues and upvote them instead of creating duplicate complaints.
   - Track live ticket timelines and verify repairs during a 7-day post-resolution dispute window.

2. **Department Field Officers** (*Roads, Sanitation, Electricity, Water & Drainage*):
   - Access filtered dispatch queues prioritized by dynamic urgency and SLA countdowns.
   - Dispatch crews, acknowledge tickets, and update progress.
   - Upload mandatory proof-of-fix photographs and repair notes to formally resolve issues.

3. **Municipal Administration / Commissioner**:
   - Monitor city-wide KPIs, SLA compliance rates, and department workload distributions.
   - Trigger automated SLA escalation sweeps to elevate overdue cases.
   - Inspect GIS hotspot density rings to deploy capital infrastructure upgrades.

---

## Solution

**How does your product solve the problem?**

CivicFix provides an end-to-end municipal governance system that directly eliminates these bottlenecks:
- **Spatial Deduplication Engine**: Computes spherical Haversine distances to catch open duplicates within a 50-meter radius before database insertion, prompting citizens to upvote existing issues instead of creating duplicate work orders.
- **Strict Role-Gated State Machine**: Enforces a formal lifecycle (`Submitted` -> `Acknowledged` -> `In Progress` -> `Resolved` -> `Closed`). Marking an issue `Resolved` strictly enforces photographic proof-of-work upload.
- **Citizen Dispute Window**: Citizens have 7 days to verify the repair proof or dispute and reopen the ticket with notes.
- **Automated Escalation Protocol**: Background cron jobs compare elapsed time against category SLA rules, auto-escalating overdue tickets from Department Staff (Tier 0) -> Department Head (Tier 1) -> Municipal Commissioner (Tier 2).
- **Dynamic Priority Scoring**: Prioritizes tickets using citizen upvotes, elapsed age, and category hazard weights so critical failures rise automatically.

---

## Key Features

**What can users actually do?**

- **Geotagged Issue Reporting**: Pinpoint defects on an interactive Leaflet map with reverse geocoding and attach up to 3 photographs.
- **Pre-Submission Duplicate Warning**: Get alerted in real time if a matching issue exists within 50m, with a 1-click option to upvote instead of duplicate.
- **1-Click Citizen Upvoting**: Boost issue priority with one vote per authenticated citizen.
- **Live SLA Countdown Timers**: View color-coded visual badges indicating safe, warning, and overdue states across all tickets.
- **Field Officer Dispatch Queue**: Filter and sort tickets by department, urgency, and SLA status; acknowledge, dispatch, or reject with notes.
- **Proof-of-Fix Mandatory Verification**: Upload photographic evidence and repair documentation to mark tickets resolved.
- **Executive Analytics Dashboard**: Visualize department workloads and category breakdowns with interactive Recharts diagrams.
- **Geographic Hotspot Density Map**: Analyze concentric density rings highlighting spatial clusters exceeding safety thresholds across city hubs.
- **SLA Rules Configuration**: Customize statutory turnaround limits (in hours) per defect type.
- **Automated SLA Sweep Trigger**: Execute idempotent SLA checks on demand or via scheduled cron jobs.
- **Dark & Light Mode Support**: Seamlessly toggle between dark and light themes with persistent user preferences.

---

## Tech Stack

**What technologies did you use?**

- **Frontend Framework**: React 18 (Vite 5) - Single-page application with responsive routing and state management.
- **Styling**: Tailwind CSS 3.4 - Custom municipal theme with full Dark/Light mode support.
- **Mapping & GIS**: Leaflet & React-Leaflet - Interactive OpenStreetMap tile layer with custom SVG markers and hardware-accelerated dark mode styling.
- **Data Visualization**: Recharts - Declarative SVG charts for municipal analytics.
- **Icons**: Lucide React - Accessible UI iconography.
- **Backend API**: Node.js 20+ & Express 4.19 - RESTful API architecture with modular routers, controllers, and middleware.
- **Database & ODM**: MongoDB & Mongoose 8.4 - Document-oriented data modeling, indexing, and schema validation.
- **In-Memory Embedded DB**: mongodb-memory-server - Automatic fallback for instant, zero-configuration local execution.
- **Authentication**: JWT (jsonwebtoken) & Bcrypt.js - Stateless bearer token authentication with encrypted password hashing.
- **Testing**: Node.js Native Test Runner (`node --test`) - Zero-dependency unit testing suite covering algorithms and state machines.

---

## Architecture

**Explain the major components of your application.**

```text
+--------------------------------------------------------+
|                   React 18 Client                      |
|   (Vite SPA, Tailwind CSS, Leaflet GIS, Recharts)      |
+---------------------------+----------------------------+
                            | (Axios HTTP + JWT Bearer)
                            v
+--------------------------------------------------------+
|                   Express REST API                     |
|  |-- Auth & RBAC Middleware (JWT Verification)         |
|  |-- Rate Limiter (50 Submissions / Hour per User)     |
|  |-- Haversine Distance Engine (50m Deduplication)     |
|  |-- Priority Scoring Algorithm                        |
|  |-- Lifecycle State Machine (Proof Enforcer)          |
|  \-- Automated Cron Escalation Engine                  |
+---------------------------+----------------------------+
                            | (Mongoose ODM)
                            v
+--------------------------------------------------------+
|                   MongoDB Database                     |
|  Schemas: User, Issue, Department, Category,           |
|           SLARule, Notification                        |
+--------------------------------------------------------+
```

### Lifecycle State Machine
```text
Submitted ---> Acknowledged ---> In Progress ---> Resolved ---> Closed
    |               |                                |
    \-------> Rejected <-----------------------------\----> Reopened (Citizen Dispute within 7 days)
```

### Priority Scoring Formula
$$\text{Priority Score} = (\text{Upvotes} \times 2.5) + (\text{Age in Days} \times 1.5) + (\text{Category Severity} \times 3.0)$$

---

## Local Setup

**Provide clear instructions for running the application.**

### Prerequisites
- Node.js: v18.0.0 or higher
- npm: v9.0.0 or higher
- Git: Installed and configured

*(Zero external database setup required: CivicFix includes an automated embedded MongoDB engine that boots and seeds automatically if no local MongoDB instance is detected.)*

### Installation & Startup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/darshan1117/Civic_Fix.git
   cd Civic_Fix
   ```

2. **Install all dependencies**:
   ```bash
   npm run install-all
   ```

3. **Run automated test suite**:
   ```bash
   npm test
   ```
   *Executes 22 automated unit tests validating state machine transitions, Haversine spatial math, SLA deadlines, and priority algorithms.*

4. **Start the development servers**:
   ```bash
   npm run dev
   ```
   - Frontend Application: http://localhost:3000
   - Backend REST API: http://localhost:5000
   - API Health Check: http://localhost:5000/api/health

### Evaluation Personas (1-Click Switcher)
The top navigation bar contains a 1-click persona switcher to test different roles immediately:
- **Admin**: `admin@civicfix.org` / `Password123!` (Commissioner access to analytics, SLA rules, and escalation sweeps)
- **Roads Officer**: `roads.officer@civicfix.org` / `Password123!` (Dispatch queue, crew deployment, proof-of-fix resolution)
- **Sanitation Officer**: `sanitation.officer@civicfix.org` / `Password123!` (Solid waste triage and resolution)
- **Electricity Officer**: `electricity.officer@civicfix.org` / `Password123!` (Power outages and streetlighting triage)
- **Citizen**: `citizen1@civicfix.org` / `Password123!` (Report issues, upvote, dispute/confirm resolution)

---

## Environment Variables

**Document required configuration without exposing secrets.**

Create a `.env` file inside the `server/` directory:

```env
# Server Port
PORT=5000

# Environment Mode
NODE_ENV=development

# JWT Authentication Secret
JWT_SECRET=civicfix_super_secure_jwt_secret_key_2026

# Database URI (Optional: omit to use embedded in-memory MongoDB automatically)
# MONGO_URI=mongodb://127.0.0.1:27017/civicfix

# SLA Demonstration Mode ('hours' for production, 'minutes' for live demo evaluations)
SLA_TIME_UNIT=hours

# Cron Escalation Key
CRON_SECRET=civicfix_escalation_secret_token_2026
```

---

## Deployment

**Provide links or instructions for accessing the final application.**

- **GitHub Repository**: [https://github.com/darshan1117/Civic_Fix](https://github.com/darshan1117/Civic_Fix)
- **Deployed Backend API**: [https://civic-fix-tgva.onrender.com](https://civic-fix-tgva.onrender.com)
- **API Health Check**: [https://civic-fix-tgva.onrender.com/api/health](https://civic-fix-tgva.onrender.com/api/health)
- **Deployed Frontend Application**: [https://civic-fix-darshan1117s-projects.vercel.app](https://civic-fix-darshan1117s-projects.vercel.app)

### Production Build Instructions
To build and verify the optimized production distribution:
```bash
npm run build
```
This compiles all frontend assets into `client/dist`.

### Hosting Configuration
- **Frontend (Vercel)**:
  - Root Directory: `client`
  - Build Command: `npm run build`
  - Output Directory: `dist`
- **Backend (Render / Railway)**:
  - Root Directory: `server`
  - Start Command: `node server.js`
  - Environment Variables: Configure `PORT`, `NODE_ENV=production`, `JWT_SECRET`, `MONGO_URI` (MongoDB Atlas), and `CRON_SECRET`.
