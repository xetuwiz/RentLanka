# RentLanka
[![CI Deployment](https://github.com/xetuwiz/RentLanka/actions/workflows/deploy.yml/badge.svg)](https://github.com/xetuwiz/RentLanka/actions)
 🚗

A vehicle rental platform for Sri Lanka — built as a university hackathon project (SE3090 module).

---

## 🔗 Live URLs

| Service | URL |
|---------|-----|
| **Frontend** | https://rentlanka.vercel.app |
| **API** | https://rentlanka-api.onrender.com/api |

---

## 📋 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19 + Vite, React Router, React Hook Form + Zod, TanStack Query |
| Map | Leaflet + react-leaflet |
| Backend | .NET 8 (ASP.NET Core Web API, C# 12) |
| ORM | Entity Framework Core 8 + Npgsql |
| Database | PostgreSQL 16 (Neon.tech) |
| Auth | JWT (access 15 min, refresh 7 days) + BCrypt |
| Rate Limiting | Built-in ASP.NET Core (100 req/min) |
| Spatial Data | GeoJSON → SpatialUnit table (Country → Province → District → DS Division) |
| Hosting | Render (API) + Vercel (frontend) |
| CI/CD | GitHub Actions (build checks on push to main) |

> **No PostGIS, no Docker, no AI agent.**  
> Spatial hierarchy goes down to **DS Division** level only — GN Divisions are excluded.

---

## 🧠 Team Roles (Vertical Division)

| Member | Feature | Responsibility |
|--------|---------|----------------|
| **Person A** | Spatial + Vehicles | `SpatialUnit` & `Vehicle` models, `SpatialController`, `VehiclesController`, `SpatialImportService` (GeoJSON), `VehicleService` (Haversine nearby search); Frontend: `VehicleList`, `VehicleMap`, `SpatialUnitSearch`, filters |
| **Person B** | Auth + Customer + Booking | `User` model, `AuthController` (JWT/refresh), `BookingsController`, `BookingService` (availability check); Frontend: `Login`, `Register`, `BookingForm`, `BookingList` / `CustomerDashboard` |
| **Person C** | Owner + Admin + DevOps | `OwnerController`, `AdminController`, `AdminService`; Frontend: `OwnerDashboard`, `AdminPanel`; Render + Vercel setup, GitHub Actions |

---

## 🗂️ Repository Structure

```
RentLanka/
├── RentLanka.Api/              # .NET 8 backend
│   ├── Controllers/
│   ├── Data/                   # AppDbContext
│   ├── Dtos/
│   ├── GeoData/                # lka_admin0..3.geojson (Country→DS Division)
│   ├── Models/                 # User, SpatialUnit, Vehicle, Booking
│   ├── Services/               # VehicleService, BookingService, AdminService, SpatialImportService
│   ├── Program.cs
│   └── appsettings.json
├── rentlanka-app/              # React + Vite frontend
│   └── src/
│       ├── api/                # endpoints.js (axios + interceptors)
│       ├── context/            # AuthContext.jsx
│       ├── hooks/              # useDebounce, useSpatialSearch
│       ├── components/
│       │   ├── common/         # RequireAuth, SpatialUnitSearch
│       │   └── map/            # VehicleMap
│       └── features/
│           ├── auth/           # Login, Register
│           ├── vehicles/       # VehicleList, VehicleCard
│           ├── bookings/       # BookingForm, BookingList
│           ├── owner/          # OwnerDashboard
│           └── admin/          # AdminPanel
└── .github/workflows/
    └── deploy.yml              # CI build checks (Render + Vercel auto-deploy on push)
```

---

## 🚀 Quick Start

### Backend

```bash
cd RentLanka.Api
dotnet restore
dotnet run
# Swagger at https://localhost:5001/swagger
```

Set environment variables (or edit `appsettings.json`):
```
ConnectionStrings__Default=Host=...;Database=rentlanka;...
Jwt__Key=<32+ char secret>
```

### Frontend

```bash
cd rentlanka-app
npm install
cp .env.example .env.local   # set VITE_API_URL=http://localhost:5001/api
npm run dev
```

---

## 🌍 Spatial Hierarchy

Sri Lanka's administrative levels imported from GeoJSON at startup:

```
Country (LK)
  └─ Province  (9)
       └─ District  (25)
            └─ DS Division  (331)
```

> GN (Grama Niladhari) Divisions are **not included** — DS Division is the lowest level.

---

## 🛡️ Default Seed Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@rentlanka.com | admin123 |

---

## 📋 Key API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | Public | Register (CUSTOMER or OWNER) |
| POST | `/api/auth/login` | Public | Login → JWT |
| POST | `/api/auth/refresh` | Public | Refresh access token |
| GET | `/api/vehicles` | Auth | List all vehicles |
| GET | `/api/vehicles/search` | Auth | Filter by spatial unit, type, price |
| GET | `/api/vehicles/nearby` | Auth | Haversine radius search |
| POST | `/api/bookings` | CUSTOMER | Create booking |
| GET | `/api/bookings/my` | CUSTOMER | My bookings |
| GET | `/api/owner/bookings` | OWNER | Bookings on my vehicles |
| PATCH | `/api/owner/bookings/{id}/accept` | OWNER | Accept booking |
| GET | `/api/admin/dashboard` | ADMIN | Counts |

---

## 🏁 Submission

- Live app: https://rentlanka.vercel.app
- API: https://rentlanka-api.onrender.com/api
- Demo video: _2-minute walkthrough covering all flows_
