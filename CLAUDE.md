# Smart Parking System

A full-stack IoT-enabled parking management system with web UI, REST API, real-time communication, and physical hardware integration for automatic gate control and license plate recognition.

## Architecture Overview

```
SmartParkingSystem/
├── client/        # React + Vite frontend (port 5173)
├── server/        # Node.js + Express backend (port 4000)
├── ai-service/    # Python FastAPI OCR placeholder service
├── rpi5/          # Raspberry Pi 5 hardware controller
└── Demo/          # Demo/test scripts
```

## Running the Project

```bash
# From root directory
npm run dev:client   # React frontend → http://localhost:5173
npm run dev:server   # Express backend → http://localhost:4000
```

For the AI service (Python):

```bash
cd ai-service
pip install -r requirements.txt
uvicorn app:app --reload
```

## Tech Stack

| Layer    | Technology                                                              |
| -------- | ----------------------------------------------------------------------- |
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion, Chart.js, Socket.IO Client |
| Backend  | Node.js, Express 4, Prisma 5, Socket.IO, MQTT, jsonwebtoken, bcryptjs   |
| Database | PostgreSQL (via Prisma ORM)                                             |
| AI/OCR   | FastAPI + OpenCV + Pytesseract (placeholder); RapidOCR + ONNX (on RPi5) |
| Hardware | Raspberry Pi 5, GPIO, MQTT broker                                       |

## Backend (`server/`)

### Structure

```
server/src/
├── controllers/    # HTTP request handlers (all async with try/catch)
├── services/       # Business logic
├── repositories/   # Data access layer (all Prisma — no mock data)
├── routes/         # Express route definitions (protected routes use authenticate)
├── middlewares/    # authenticate (JWT) + errorHandler
├── validators/     # Request validation
├── sockets/        # Socket.IO real-time handlers
├── config/         # db.js (Prisma client), env.js (includes jwtSecret)
├── app.js          # Express setup (CORS, middleware, routes)
└── index.js        # Entry point: HTTP server + Socket.IO + MQTT, sets app.set('io', io)
```

### API Routes

| Route                     | Auth required | Purpose                                          |
| ------------------------- | ------------- | ------------------------------------------------ |
| `POST /api/auth/login`    | No            | User login — returns JWT + user                  |
| `GET /api/users`          | Yes           | List all users (admin)                           |
| `GET /api/vehicles`       | Yes           | Vehicles for logged-in user                      |
| `GET /api/parking-spots`  | No            | Parking spot listings                            |
| `GET /api/reservations`   | Yes           | Reservations (client sees own, admin sees all)   |
| `GET /api/payments`       | Yes           | Payments (client sees own, admin sees all)       |
| `GET /api/hardware`       | Yes           | Hardware status                                  |
| `GET /api/reports`        | Yes           | Analytics (real DB aggregates)                   |
| `GET /api/notifications`  | Yes           | Notifications for logged-in user                 |
| `GET /api/parking-events` | Yes           | Audit log (last 100)                             |
| `POST /api/anpr/detect`   | No            | License plate detection — called by RPi hardware |

### Authentication (JWT)

Login via `POST /api/auth/login` returns `{ token, user }`. The token is a signed JWT.

All protected routes require `Authorization: Bearer <token>` header, validated by the `authenticate` middleware in `server/src/middlewares/authMiddleware.js`.

The `io` Socket.IO instance is available throughout the app via `req.app.get('io')`.

### Key Services

- **`anprService`** — Validates detected plate against upcoming reservations (15-min early buffer); on entry: marks reservation `ACTIVE`, sets spot `isAvailable: false`, creates `ParkingEvent`, emits `parking:spot:updated` via Socket.IO, publishes MQTT `OPEN`; on full parking: publishes MQTT `DENY`
- **`barrierService`** — Entry/exit barrier control for MQTT-triggered events (separate from ANPR HTTP flow)
- **`mqttService`** — MQTT broker communication (disabled by default: `MQTT_ENABLED=false`)
- **`parkingSpotsService`** — Spot availability queries
- **`reservationsService`** — Accepts `{ userId, role }` — clients see only their own reservations
- **`paymentsService`** — Accepts `{ userId, role }` — clients see only their own payments
- **`authService`** — bcrypt password verification + JWT signing
- **`reportsService`** — Real-time DB aggregates: occupancy %, avg duration, daily/monthly revenue, issue counts

## Database (`server/prisma/`)

Schema file: `server/prisma/schema.prisma`
Seed script: `server/prisma/seed.js`

### Models

| Model          | Purpose                                                   |
| -------------- | --------------------------------------------------------- |
| `User`         | Users with ADMIN/CLIENT roles                             |
| `Vehicle`      | License plates linked to users                            |
| `ParkingSpot`  | Spot inventory with hourly pricing and `isAvailable` flag |
| `Reservation`  | Time-based spot reservations                              |
| `Payment`      | Payment records per reservation                           |
| `ParkingEvent` | Audit log of all parking activity                         |
| `Notification` | User-facing notifications                                 |

### Key Enums

- `Role`: `ADMIN`, `CLIENT`
- `ReservationStatus`: `ACTIVE`, `UPCOMING`, `COMPLETED`, `CANCELLED`, `NO_SHOW`
- `ParkingEventType`: `ENTRY`, `EXIT`, `RESERVATION_CREATED`, `RESERVATION_CANCELLED`, `CONFLICT`, `NO_SHOW`, `DENIED`
- `EntryType`: `RESERVATION`, `WALK_IN`

### Seed Accounts

Run with `npx prisma db seed` from `server/`:

| Email              | Password    | Role   |
| ------------------ | ----------- | ------ |
| admin@parking.com  | admin123    | ADMIN  |
| client@parking.com | client123   | CLIENT |
| ion@example.com    | password123 | CLIENT |
| maria@example.com  | password123 | CLIENT |

Seed also creates: 8 parking spots (A1–A4, B5–B8), 8 reservations, 8 payments, 9 parking events, 6 notifications.

## Frontend (`client/`)

### Structure

```
client/src/
├── pages/
│   ├── admin/       # AdminDashboardPage, AdminLiveMapPage, AdminReportsPage
│   ├── client/      # ClientDashboardPage, ClientParkingPage, ClientReservationsPage,
│   │                #   ClientVehiclesPage, ClientProfilePage
│   ├── auth/        # LoginPage, RegisterPage
│   └── public/      # LandingPage
├── components/
│   ├── layout/      # DashboardLayout, Sidebar, Navbar, AuthShell
│   ├── cards/
│   ├── dashboard/
│   ├── parking/
│   ├── reports/
│   ├── reservations/
│   └── vehicles/
├── contexts/        # AuthContext.jsx — calls real backend login API, stores JWT
├── hooks/           # useAuth.js, useLiveParkingStats.js (Socket.IO)
├── routes/          # AppRouter.jsx, ProtectedRoute.jsx
├── services/        # api.js (fetch wrapper — sends Authorization header), socket.js
├── constants/       # roles.js, routes.js
└── utils/           # formatters.js
```

### Authentication Flow (Frontend)

1. `LoginPage` calls `login({ email, password })` from `useAuth()` — must be awaited (`async`)
2. `AuthContext.login` POSTs to `/api/auth/login`, stores JWT in `localStorage` under key `smart-parking-token`, stores user object under `smart-parking-user`
3. `api.js` reads the token on every request and adds `Authorization: Bearer <token>`

### Real-time Updates (Socket.IO)

On connection, server emits `parking:bootstrap` with real spot data from DB:

```js
{ spots: [...], availableSpots: N, occupiedSpots: M }
```

Live events emitted by backend after ANPR entry:

- `parking:spot:updated` — `{ id, code, isAvailable }` — broadcast to all clients

## Hardware Integration

### ANPR Entry Flow (correct order)

1. GPIO button (GPIO17) pressed → camera captures frame
2. RapidOCR (ONNX) reads license plate
3. RPi POSTs `{ plate }` to `POST /api/anpr/detect`
4. Backend decides:
   - Has valid reservation → marks `ACTIVE`, sets spot unavailable, emits Socket.IO, publishes MQTT `OPEN`
   - Walk-in, spot available → sets spot unavailable, emits Socket.IO, publishes MQTT `OPEN`
   - Parking full → publishes MQTT `DENY`, creates `DENIED` event
5. RPi receives HTTP response and:
   - `allowed: true` → publishes MQTT `OPEN` on `parking/bariera_intrare/command` + actualizează display LCD
   - `allowed: false` → publishes MQTT `DENY` on `parking/bariera_intrare/command`

Both the backend (`anprService`) and the RPi (`entry_trigger.py`) publish on the command topic — the RPi publishes **after** receiving the HTTP response, acting as confirmation to the physical barrier.

### MQTT Setup (two-machine workflow)

MQTT is disabled by default so development without hardware works out of the box.

| Machine | `.env` setting | Notes |
| ------- | -------------- | ----- |
| Development (no hardware) | `MQTT_ENABLED=false` | Server starts normally, `publishCommand` is a no-op |
| Hardware testing (colega) | `MQTT_ENABLED=true` | Requires Mosquitto broker running locally on port 1883 |

The `.env` file is in `.gitignore` — each machine keeps its own value.

### MQTT Topics

| Topic                             | Direction            | Purpose                                     |
| --------------------------------- | -------------------- | ------------------------------------------- |
| `parking/bariera_intrare/trigger` | RPi → Server         | Entry barrier trigger (barrierService path) |
| `parking/bariera_iesire/trigger`  | RPi → Server         | Exit barrier trigger                        |
| `parking/bariera_intrare/command` | Server / RPi → Barrier | OPEN / DENY command (both backend and RPi publish here) |
| `parking/display`                 | Server → RPi         | Display update (free spots, pricing)        |

### AI Service (`ai-service/`)

A Python FastAPI placeholder for ANPR. Actual on-device OCR runs directly on the Raspberry Pi via `rapid_ocr.py`. The `ai-service` can be used for testing the recognition pipeline without hardware.

## Common Commands

```bash
# Database
npx prisma migrate dev         # Run migrations
npx prisma db seed             # Seed initial data
npx prisma studio              # Open Prisma Studio GUI

# Root workspace
npm run dev:client
npm run dev:server
```
