# 🏥 MediFlow 3D — AI-Powered Hospital Live Queue, Triage & Wait-Time Predictor

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=for-the-badge&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)
![Supabase](https://img.shields.io/badge/Supabase-Realtime-3ECF8E?style=for-the-badge&logo=supabase)
![Gemini AI](https://img.shields.io/badge/Gemini_2.5_Flash-@google/genai-8E75B2?style=for-the-badge&logo=google)
![Docker](https://img.shields.io/badge/Docker-Google_Cloud_Run-2496ED?style=for-the-badge&logo=docker)

> Solve hospital waiting room chaos. A high-fidelity 3D white-and-purple hospital operations dashboard featuring live patient token queues, automated physician cabin dispatching, and multimodal symptom triage powered by **Gemini 2.5 Flash** (`@google/genai`) and **Supabase Realtime**.

---

## ✨ Key Features

1. **3D Doctor Cabin Suites:**
   - **Cabin 101:** General Medicine — *Dr. Sarah Mitchell, MD*
   - **Cabin 102:** Cardiology — *Dr. Marcus Vance, FACC*
   - **Cabin 103:** Orthopedics — *Dr. Elena Rostova, MD*
   - Displays live active tokens (`TK-101`, etc.), active consultation status, patient age/complaint, and one-click "Call Next Patient" controls.

2. **Live Animated Patient Queue:**
   - Real-time token position and cumulative wait-time calculation.
   - Sorted dynamically by **Gemini AI Priority Score (1–100)**:
     - 🔴 **CRITICAL (Score 95–100):** Immediate fast-track (e.g., Acute STEMI, severe dyspnea, trauma).
     - 🟣 **MODERATE (Score 40–70):** Elevated urgency (e.g., high fever, fractures, palpitations).
     - ⚪ **ROUTINE (Score 10–30):** Stable outpatient consultations.

3. **AI Smart Triage Engine (`/triage`):**
   - Inputs: Patient Name, Age, Target Department, Reported Symptoms.
   - Powered by Gemini 2.5 Flash (`@google/genai`) on the server.
   - Generates urgency badge, priority score, expected consultation minutes, and clinical advisory note.
   - Includes one-click test symptom presets and confetti celebrations.

4. **Doctor Cabin Control Panel (`/doctor`):**
   - Dedicated interface for clinicians to view patient history, record consultation notes, advance queues, and trigger STAT emergencies.

5. **One-Click Simulator Bar:**
   - **Call Next Patient:** Advances the first available doctor cabin.
   - **Add Emergency Case:** Injects an acute critical patient at priority 99.
   - **Reset Demo:** Restores pristine demo state in one click.

6. **Dual Storage Architecture:**
   - **Supabase Realtime:** Syncs database mutations across all connected clients.
   - **Autonomous In-Memory Fallback:** The app runs 100% out of the box with zero configuration required even before API keys are added.

---

## 🚀 Quick Start

### 1. Install & Run Locally
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the 3D Clinic Hub.

### 2. Production Build
```bash
npm run build
npm run start
```

---

## ⚙️ Environment Variables

Create `.env.local` based on `.env.example`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
GEMINI_API_KEY=your-gemini-api-key
```

*Note: If environment variables are omitted, MediFlow 3D automatically runs using its built-in in-memory state engine and clinical triage fallback without breaking.*

---

## 🗄️ Supabase Setup

1. Create a project on [supabase.com](https://supabase.com).
2. Open **SQL Editor**, paste the contents of `/supabase/schema.sql`, and click **Run**.
3. Copy your project **URL** and **anon key** into `.env.local` or Cloud Run environment variables.

---

## 🐳 Google Cloud Run Deployment

The project includes a multi-stage `Dockerfile` and `next.config.mjs` with `output: 'standalone'` ready for Google Cloud Run:

```bash
# Build Docker image
docker build -t mediflow-3d .

# Run locally on port 8080
docker run -p 8080:8080 -e PORT=8080 mediflow-3d
```

### Deploying via Google Cloud Run Console:
1. Push this repository to GitHub.
2. Go to [Google Cloud Run Console](https://console.cloud.google.com/run) -> **Create Service**.
3. Select **Continuously deploy from a repository** and choose `mediflow-3d`.
4. Choose **Dockerfile** build.
5. Set port to `8080` and allow unauthenticated invocations.
6. Under **Variables & Secrets**, add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `GEMINI_API_KEY`.
7. Click **Create** to deploy.

---

## 📁 Project Architecture

```
├── .dockerignore
├── .env.example
├── Dockerfile                   # Cloud Run Node 20 Alpine Standalone
├── next.config.mjs              # Standalone Next.js configuration
├── package.json
├── supabase/
│   └── schema.sql               # Supabase RLS, tables, realtime publication & seed data
├── src/
│   ├── components/
│   │   ├── Navbar3D.tsx         # 3D Purple & White Navigation
│   │   ├── CabinCard3D.tsx      # 3D Doctor Cabin with live token display
│   │   ├── TokenQueueList.tsx   # Live animated queue sorted by priority
│   │   ├── SimulatorBar.tsx     # One-Click Simulator Controls
│   │   ├── StatsBanner.tsx      # Live Clinic KPIs & Metrics
│   │   └── TriageForm3D.tsx     # Gemini 2.5 Flash Triage Form
│   ├── lib/
│   │   ├── gemini.ts            # @google/genai Gemini 2.5 Flash integration
│   │   ├── mockData.ts          # Initial seed data for cabins and tokens
│   │   ├── store.ts             # Unified store with Supabase & memory fallback
│   │   ├── supabase.ts          # Supabase client with fallback detection
│   │   ├── types.ts             # TypeScript definitions
│   │   └── validators.ts        # Zod validation schemas
│   ├── pages/
│   │   ├── api/
│   │   │   ├── advance.ts       # POST: Advance cabin queue
│   │   │   ├── emergency.ts     # POST: One-click STAT emergency injection
│   │   │   ├── reset.ts         # POST: Reset demo state
│   │   │   ├── state.ts         # GET: Live cabins and tokens
│   │   │   └── triage.ts        # POST: Gemini AI triage intake
│   │   ├── _app.tsx
│   │   ├── _document.tsx
│   │   ├── doctor.tsx           # Doctor Cabin Control Panel
│   │   ├── index.tsx            # Main 3D Clinic Hub
│   │   └── triage.tsx           # AI Patient Check-In Page
│   └── styles/
│       └── globals.css          # 3D White & Purple aesthetic tokens
```

---

## 🏆 Hackathon Submission Checklist

- [x] Complete production Next.js + React + TypeScript source code with zero placeholders or `// TODO`s.
- [x] Gemini 2.5 Flash (`@google/genai`) AI triage with structured JSON response & clinical heuristics fallback.
- [x] Supabase Realtime SQL schema (`/supabase/schema.sql`) with Row Level Security (RLS).
- [x] Clean Minimalist 3D White & Purple UI (`#FAF9FF`, `#FFFFFF`, `#7C3AED`, `#F3E8FF`).
- [x] Doctor Cabins 101, 102, 103 with live active tokens and instant queue advancement.
- [x] One-Click Interactive Simulator Bar ("Call Next Patient", "Add Emergency Case", "Reset Demo").
- [x] Standalone `Dockerfile` exposing port 8080 for Google Cloud Run.
