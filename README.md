# CivicFix — Civic Issue Reporting & Resolution Tracking Platform

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Leaflet](https://img.shields.io/badge/Leaflet-1.9-green?logo=leaflet)](https://leafletjs.com/)
[![Vitest](https://img.shields.io/badge/Vitest-2.1-yellow?logo=vitest)](https://vitest.dev/)
[![Status](https://img.shields.io/badge/Tests-31%20Passed-emerald)]()

CivicFix is a production-grade, deployable civic issue reporting and resolution-tracking web application built for municipal corporations and smart cities. It eliminates lost WhatsApp complaints, prevents duplicate filings within 50 meters, automatically routes reports to departmental queues, enforces statutory SLA countdowns, and mandates photo proof-of-fix verification.

---

## 1. Problem Statement
Citizens report potholes, garbage dumps, dark streetlights, and ruptured water pipes through phone calls, informal WhatsApp groups, and social media mentions. These reports get lost, duplicate reports flood municipal helplines, department ownership is ambiguous, there are no enforceable deadlines for repair, and citizens never receive updates. Municipal authorities lack geographic visibility to identify neglected wards.

---

## 2. Target Users & Role-Based Access Control (RBAC)

1. **Citizen (`citizen`)**:
   - Drops a pin on the map or uses browser geolocation.
   - Uploads 1–3 photos (JPG, PNG, WebP ≤ 5MB) with automatic duplicate warning if an open report exists within 50m.
   - Can upvote existing reports (*"I face this too"*) to elevate urgency without creating duplicate tickets.
   - Tracks real-time vertical event timelines with public ticket IDs (`CF-YYYY-XXXXX`).
   - Has a **7-day dispute window** after resolution to confirm and close or dispute and reopen.

2. **Department Officer (`officer`)**:
   - Accesses `/officer/queue` showing only work orders routed to their assigned agency (e.g., Roads, Sanitation, Electricity, Water).
   - Queue is dynamically sorted by priority score: `(upvotes × 2.5) + (age in days × 1.5) + (severity weight × 3.0)`.
   - Sees live color-coded SLA countdown chips (Green > 50%, Amber ≤ 50%, Red Overdue).
   - Transitions issues through pure state-machine stages: `Submitted → Acknowledged → In Progress → Resolved`.
   - **Resolution Gate**: Moving an issue to `Resolved` strictly requires uploading a photographic proof-of-fix and entering a resolution note.

3. **City Administrator (`admin`)**:
   - Manages citywide operations via `/admin`.
   - Live KPI stat cards (Total issues, open vs. resolved, average fix time, SLA compliance rate, escalations).
   - Interactive Recharts analytics (Departmental workload, Category distribution, Date-range trend velocity).
   - Hotspot density map highlighting high-risk clusters (≥4 open hazards in red).
   - Editable SLA rules table per category.
   - Trigger button to run automated SLA escalation checks manually on demand.

4. **Anonymous Visitor**:
   - Read-only access to `/` (landing page), `/issues` (interactive public map explorer), and `/issues/[id]` (public issue detail and timeline).

---

## 3. Key Features & Workflows

### Workflow 1: 50m Duplicate Detection
Before filing an issue, the client checks coordinates and category against the server database. If an open issue exists within **50 meters** (computed via the Haversine formula in pure TypeScript and PostgreSQL), the citizen is presented with a **"Similar issues nearby"** modal. They can choose to:
- **Upvote this existing issue instead**: Increments the issue's upvote count, elevates its priority score, and notifies the citizen when resolved.
- **Submit anyway**: If the citizen verifies it is a distinct hazard.

### Workflow 2: Pure Lifecycle State Machine
Implemented in `lib/stateMachine.ts`. Transitions are strictly enforced on both server and database:
```
Submitted ───► Acknowledged ───► In Progress ───► Resolved ───► Closed (Terminal)
    │                 │                              │
    ▼                 ▼                              ▼
 Rejected          Rejected                       Reopened (dispute within 7 days)
```
- Every transition is logged into an append-only `issue_events` ledger recording actor, timestamp, previous status, next status, and notes.

### Workflow 3: Statutory SLA Timers & Auto-Escalation
- Standard category SLAs: Streetlight (72h), Pothole (120h), Garbage (24h), Water Leakage (12h), Drainage (48h), Other (72h).
- Color-coded badges update dynamically: Green (>50% time left), Amber (<50%), Red (Overdue).
- Protected API route `/api/cron/escalate` (requires `CRON_SECRET` header or Admin session) finds overdue non-terminal tickets and advances them:
  - **Level 0 → Level 1**: Department Head alerted.
  - **Level 1 → Level 2**: City Administrator alerted.
- **Strict Idempotency**: Running the cron job repeatedly at the same point in time never causes double escalation.
- **GitHub Actions Workflow** (`.github/workflows/escalate.yml`): Dispatches every 15 minutes to bypass Vercel Hobby daily limits.
- **Demo Mode**: Set `SLA_TIME_UNIT=minutes` in `.env` to shrink hours to minutes for live demonstration.

### Workflow 4: Admin Analytics & Hotspot Density
- Leaflet Circle density overlays cluster reports within 1.5km. Clusters with ≥4 open hazards are highlighted in crimson red.
- Searchable, filterable, sortable, and paginated issues table with status, category, and overdue filters.

---

## 4. Tech Stack

- **Framework**: Next.js 14 (App Router, Server Components, Route Handlers)
- **Language**: TypeScript (Strict typing across domain and UI)
- **Styling**: Tailwind CSS, Lucide React icons, Linear/Stripe-inspired civic SaaS design language
- **Maps**: Leaflet + OpenStreetMap tiles via `react-leaflet` (Client-side dynamic imports, zero paid API keys needed)
- **Forms & Validation**: Zod, React Hook Form
- **Data Visualization**: Recharts (Bar, Pie, Area trends)
- **Unit Testing**: Vitest (31 pure function tests covering Haversine, state machine, SLA countdowns, priority, and escalation idempotency)
- **Database & Storage**: PostgreSQL / Supabase with Row Level Security (RLS) + PostGIS / Haversine fallback

---

## 5. Architecture & Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                       Client Browser                        │
│   (Citizen Map / Officer Queue / Admin Analytics Console)   │
└──────────────┬──────────────────────────────▲───────────────┘
               │ HTTP / JSON                  │ Server Responses
               ▼                              │
┌─────────────────────────────────────────────┴───────────────┐
│                    Next.js App Router                       │
│  - middleware.ts (Role-based route protection)              │
│  - lib/stateMachine.ts (Pure transition validator)          │
│  - lib/haversine.ts (50m duplicate detection)               │
│  - lib/priority.ts (Dynamic scoring engine)                 │
│  - lib/sla.ts (SLA deadline & countdown calculations)       │
│  - lib/escalation.ts (Idempotent Level 0->1->2 progression) │
└──────────────┬──────────────────────────────▲───────────────┘
               │ SQL / RLS Policies           │ Data Records
               ▼                              │
┌─────────────────────────────────────────────┴───────────────┐
│              PostgreSQL / Supabase Database                 │
│  - profiles, departments, categories, sla_rules, issues     │
│  - issue_photos, issue_upvotes (Unique PK), issue_events    │
│  - notifications, haversine_distance SQL function           │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. Local Setup Instructions

### Prerequisites
- Node.js >= 18.x
- npm >= 9.x

### Steps
1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/civicfix.git
   cd civicfix
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   ```bash
   cp .env.example .env.local
   ```
   *(The application is designed to be fully functional out of the box with seeded demo data even before external Supabase credentials are configured!)*

4. **Run unit tests**:
   ```bash
   npm test
   ```

5. **Start development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 7. Demo Credentials & 1-Click Persona Switcher

The application includes an instant **1-Click Persona Switcher** in the top navigation bar, as well as email authentication with the pre-seeded accounts below:

| Role | Name | Email | Password | Assigned Department |
|---|---|---|---|---|
| **Admin** | Aarav Sharma | `admin@civicfix.org` | `Admin123!` | Municipal Administration (All) |
| **Officer** | Priya Nair | `roads.officer@civicfix.org` | `Officer123!` | Roads & Infrastructure |
| **Officer** | Rajesh Kumar | `sanitation.officer@civicfix.org` | `Officer123!` | Solid Waste & Sanitation |
| **Officer** | Kavita Reddy | `electricity.officer@civicfix.org` | `Officer123!` | Electricity & Public Lighting |
| **Citizen** | Vikram Mehta | `citizen1@civicfix.org` | `Citizen123!` | Public Citizen |
| **Citizen** | Ananya Iyer | `citizen2@civicfix.org` | `Citizen123!` | Public Citizen |

---

## 8. Live Demonstration Mode (Minute SLAs)

To demonstrate SLA countdown transitions and automated Level 1/Level 2 escalations during an in-person or recorded evaluation:
1. Open `.env.local`
2. Change:
   ```env
   SLA_TIME_UNIT=minutes
   ```
3. Restart dev server (`npm run dev`).
4. Category SLA hours (e.g. Garbage 24h, Water Leakage 12h) now translate directly to **minutes**, allowing live deadline expiration and escalation testing in real-time.

---

## 9. Privacy & Security Considerations

- **EXIF GPS Metadata**: As noted in municipal privacy best practices, citizens' uploaded photos should have EXIF GPS tags stripped at the boundary to prevent revealing exact residential coordinates outside public civic pins.
- **Row Level Security (RLS)**: Enforced on all tables. Citizens can only create reports and upvotes for themselves; officers can update only department-assigned work orders; admins have global supervision.
- **Rate Limiting**: Citizens are limited to a maximum of 10 issue reports per hour per user account to mitigate spam flooding.
- **Cron Secret**: `/api/cron/escalate` requires a bearer secret token (`CRON_SECRET`) preventing unauthorized external triggers.

---

## 10. License & Acknowledgements
Built for academic and civic-tech evaluation. OpenStreetMap tile data © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright).
