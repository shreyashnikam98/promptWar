# 🏙️ City Life — Exploring, Experiencing & Navigating the Chaos We Call Home

> A production-oriented, responsive smart-city platform engineered for urban exploration, civic safety intelligence, heritage discovery, real-time weather telemetry, and community hazard reporting.

---

## 🌟 Key Features

1. **Urban Explorer & Curated Directory**
   - Search by city (Pune, Mumbai, Delhi, Bengaluru), category, budget/price tier, verified operating hours, and wheelchair accessibility.
   - 14 distinct urban categories: Historical landmarks, Cultural locations, Tourist attractions, Street food, Restaurants, Cafes, Hotels, Budget stays, Parks, Hospitals, Police stations, Public transport, Shopping, and Public facilities.

2. **Interactive GIS Map (Leaflet & OpenStreetMap)**
   - Category-colored pins, real-time geolocated hazard markers (accidents, cave-ins, waterlogging, poor street lighting).
   - Instant GPS "Locate Me" positioning.
   - **Safer Route Navigator**: Calculates optimal travel routes with OSRM and identifies all reported hazards within a 200m corridor of the path.

3. **City Safety Intelligence & Citizen Reporting**
   - Citizen incident submission with **photo uploads** and **in-browser voice note audio recording** (HTML5 MediaRecorder API).
   - Multi-stage moderation workflow: `Pending` → `Under Review` → `Verified Hazard` → `Resolved` / `Rejected`.
   - **Community Corroboration**: Citizens can click "Confirm Hazard" to provide live confirmation on active reports.

4. **AI & NLP Intelligence Subsystem**
   - **Complaint Classification**: Predicts hazard category from incident title & description.
   - **Automated Priority Triage**: Evaluates report urgency and corroboration counts.
   - **Duplicate Detection**: Identifies potential duplicate reports via Haversine distance (<500m) and Jaccard token similarity.
   - **Transparent Fallbacks**: Honest metadata labeling distinguishes model predictions from rule-based baseline heuristics.

5. **Best vs. Worst Places Comparison Matrix**
   - Benchmarks 2 to 4 locations side-by-side across user ratings, affordability, cleanliness ratings, wheelchair accommodations, and verified operating hours without fabricating missing data.

6. **Smart City Insights Dashboard**
   - Dynamic charts powered by Recharts (Bar, Pie, Area trends) computed via real-time MongoDB aggregation queries.

7. **Atmospheric & Weather Intelligence**
   - Real-time OpenWeather API integration with honest fallback to regional climatological reference baselines when API keys are unconfigured.

8. **Role-Based Access Control (RBAC)**
   - Three distinct roles: **Citizen User**, **Safety Moderator**, and **Municipal Administrator**.
   - 1-Click Evaluation profiles on the login page for instant demonstration.

---

## 🚀 Quick Start (Local Development)

The application includes an **in-memory MongoDB fallback**, allowing it to boot and run immediately without requiring local `mongod` installation or an immediate Atlas setup.

### 1. Install Dependencies
```bash
# In project root:
npm run install-all
```
*(Or navigate to `/server` and `/client` individually and run `npm install`)*

### 2. Seed Database (Optional - Server auto-seeds on first boot)
```bash
npm run seed --prefix server
```

### 3. Start the Backend API (Port 5000)
```bash
npm run dev --prefix server
```
Server runs at `http://localhost:5000`. Health check: `http://localhost:5000/api/health`.

### 4. Start the Frontend Client (Port 5173)
```bash
npm run dev --prefix client
```
Open your browser at `http://localhost:5173`.

---

## 🔑 Pre-Configured Demo Accounts

For college presentation and grading, use these pre-seeded accounts:

| Role | Email | Password | Access Privileges |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@citylife.org` | `Admin@123456` | Place CRUD, Role Assignment, Audit Trail |
| **Moderator** | `moderator@citylife.org` | `Mod@123456` | Review Hazards, Verify/Reject, Moderation Notes |
| **Citizen User** | `citizen@citylife.org` | `User@123456` | Report Hazards, Audio Notes, Reviews, Favorites |

*(Quick 1-Click login buttons are available on the [Login Page](http://localhost:5173/login)).*

---

## 🍃 MongoDB Atlas Setup Guide

To connect City Life to a persistent cloud database on MongoDB Atlas:

1. **Sign Up / Log In**: Visit [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and register for a free account.
2. **Create Cluster**: Select the **M0 Free Tier** cluster and choose an AWS/GCP region closest to your users (e.g., `ap-south-1` Mumbai).
3. **Create Database User**:
   - Go to **Security** → **Database Access** → **Add New Database User**.
   - Choose `Password` authentication (e.g., user: `citylife_admin`, password: `your_strong_password`).
   - Assign the **Read and write to any database** privilege.
4. **Configure Network Access**:
   - Go to **Security** → **Network Access** → **Add IP Address**.
   - For local development and Render deployment, add `0.0.0.0/0` (Allow Access from Anywhere) or add your current IP address.
5. **Get Connection String**:
   - Click **Databases** → **Connect** → **Drivers** (Node.js).
   - Copy the URI string:
     ```
     mongodb+srv://citylife_admin:<password>@cluster0.xxxx.mongodb.net/citylife?retryWrites=true&w=majority
     ```
6. **Configure in Server**:
   - Open `server/.env` and paste your string:
     ```env
     MONGODB_URI=mongodb+srv://citylife_admin:your_password@cluster0.xxxx.mongodb.net/citylife?retryWrites=true&w=majority
     ```
   - Restart the server. It will automatically detect MongoDB Atlas, establish the connection, and seed the initial dataset.

---

## 🌐 Production Deployment Guide

### Deploying Backend to Render
1. Create a free account on [render.com](https://render.com).
2. Click **New +** → **Web Service** and connect your GitHub repository.
3. Configure the settings:
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Add Environment Variables in the Render dashboard:
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
   - `MONGODB_URI`: *Your MongoDB Atlas connection URI*
   - `JWT_SECRET`: *A secure random string*
   - `CLIENT_URL`: *Your deployed Vercel frontend URL*
   - `OPENWEATHER_API_KEY`: *(Optional) Your OpenWeather API key*
5. Click **Create Web Service**.

### Deploying Frontend to Vercel
1. Create a free account on [vercel.com](https://vercel.com).
2. Click **Add New...** → **Project** and import your repository.
3. Configure settings:
   - **Root Directory**: `client`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Set Environment Variable:
   - `VITE_API_BASE_URL`: `https://your-render-backend.onrender.com/api`
5. The included `client/vercel.json` ensures client-side routing handles direct URL loads without 404 errors.
6. Click **Deploy**.

---

## 🧪 Running Automated Tests
```bash
npm test --prefix server
```
Executes the native test suite verifying:
- NLP Complaint Category classification accuracy
- Urgent incident triage priority logic
- Proximity-based duplicate candidate detection (<100m)
- Transparent fallback behavior for external weather endpoints
- Bcrypt password hash generation & verification
- JWT payload encoding and role extraction
