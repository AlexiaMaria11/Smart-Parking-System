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

| Layer    | Technology                                                                              |
| -------- | --------------------------------------------------------------------------------------- |
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion, Chart.js, Socket.IO Client, react-datepicker |
| Backend  | Node.js, Express 4, Prisma 5, Socket.IO, MQTT, jsonwebtoken, bcryptjs                  |
| Database | PostgreSQL (via Prisma ORM)                                                             |
| AI/OCR   | FastAPI + OpenCV + Pytesseract (placeholder); RapidOCR + ONNX (on RPi5)                |
| Hardware | Raspberry Pi 5, GPIO, MQTT broker                                                       |

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

| Route                        | Auth required | Purpose                                          |
| ---------------------------- | ------------- | ------------------------------------------------ |
| `POST /api/auth/login`       | No            | User login — returns JWT + user                  |
| `GET /api/users`             | Yes           | List all users (admin)                           |
| `GET /api/vehicles`          | Yes           | Vehicles for logged-in user                      |
| `GET /api/parking-spots`     | No            | Parking spot listings                            |
| `GET /api/reservations`      | Yes           | Reservations (client sees own, admin sees all)   |
| `GET /api/payments`          | Yes           | Payments (client sees own, admin sees all)       |
| `PATCH /api/payments/:id/pay`| Yes           | Simulate payment — calculates final amount and marks PAID |
| `GET /api/reports`           | Yes           | Analytics (real DB aggregates)                   |
| `GET /api/notifications`     | Yes           | Notifications for logged-in user                 |
| `GET /api/parking-events`    | Yes           | Audit log (last 100)                             |
| `POST /api/anpr/detect`      | No            | License plate detection — called by RPi hardware |

### Authentication (JWT)

Login via `POST /api/auth/login` returns `{ token, user }`. The token is a signed JWT.

All protected routes require `Authorization: Bearer <token>` header, validated by the `authenticate` middleware in `server/src/middlewares/authMiddleware.js`.

The `io` Socket.IO instance is available throughout the app via `req.app.get('io')`.

### Key Services

- **`anprService`** — Validates detected plate against upcoming reservations (15-min early buffer); on entry with reservation: marks `ACTIVE`, sets spot unavailable, emits Socket.IO, publishes MQTT `OPEN`; on walk-in with registered plate: creates `Reservation` (ACTIVE, totalCost=0) + `Payment` (PENDING, amount=0), sets spot unavailable; on full parking: publishes MQTT `DENY`
- **`barrierService`** — Entry/exit barrier control for MQTT-triggered events (separate from ANPR HTTP flow); exit path checks for pending payment — if found, publishes MQTT `DENY` + sends notification; on successful exit: completes reservation and frees spot
- **`mqttService`** — MQTT broker communication (disabled by default: `MQTT_ENABLED=false`)
- **`parkingSpotsService`** — Spot availability queries
- **`reservationsService`** — Accepts `{ userId, role }` — clients see own only; creates `Notification` on create (with redirect info if conflict) and on cancel; `extend(id, extraHours)` recalculates and updates `totalCost`
- **`paymentsService`** — Accepts `{ userId, role }` — clients see own only; `pay(id, userId)`: validates ownership, if `amount === 0` (walk-in) calculates `durationHours × pricePerHour`, updates `reservation.totalCost`, marks payment PAID, creates "Payment confirmed" notification
- **`authService`** — bcrypt password verification + JWT signing
- **`reportsService`** — Real-time DB aggregates: occupancy %, avg duration, daily/monthly revenue, issue counts

### Key Repository Notes

- **`reservationsRepository.findAll`** — includes `payments: { select: { id, status, amount }, take: 1 }` so the frontend knows payment status per reservation
- **`paymentsRepository`** — has `findById(id)` (includes spot pricePerHour) and `pay(id, finalAmount)`

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
- `EntryType`: `RESERVATION`, `WALK_IN`, `CONFLICT`

### Seed Accounts

Run with `npx prisma db seed` from `server/`:

| Email              | Password    | Role   |
| ------------------ | ----------- | ------ |
| admin@parking.com  | admin123    | ADMIN  |
| client@parking.com | client123   | CLIENT |
| ion@example.com    | password123 | CLIENT |
| maria@example.com  | password123 | CLIENT |
| alex@example.com   | password123 | CLIENT |
| ana@example.com    | password123 | CLIENT |
| radu@example.com   | password123 | CLIENT |

Seed creates: 8 parking spots (A1–A3 reservation, B4–B6 walk-in, C7–C8 conflict), 11 reservations, 11 payments, 13 parking events, 11 notifications.

## Frontend (`client/`)

The entire UI is in **English**. All date/time formatting uses `"en-GB"` locale.

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
│   ├── parking/     # SpotDetailsCard, DateTimePicker (react-datepicker wrapper with custom CSS)
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

### Payment Flow (Simulated)

Walk-in clients with a registered plate get a `Reservation` (ACTIVE, totalCost=0) + `Payment` (PENDING, amount=0) created automatically at entry by `anprService`.

The client pays via the **Pay** button on `ClientDashboardPage` (active reservations panel). `PATCH /api/payments/:id/pay` calculates the final amount for walk-ins (`durationHours × pricePerHour`, rounded to 0.1h), updates `reservation.totalCost`, and marks the payment PAID.

The exit barrier (`barrierService`) checks for a pending payment before opening — DENY if unpaid.

### Key Frontend Patterns

- **`refreshKey`** — `useState(0)` incremented to force re-fetch in `useApi` hooks after mutations
- **`actionState` map** — per-reservation `{ payLoading, payError, cancelLoading, cancelError }` for independent loading states on multi-reservation lists
- **Chart data** — computed with `useMemo` from API responses (no mock data anywhere)
- **`DateTimePicker`** — `client/src/components/parking/DateTimePicker.jsx` wraps `react-datepicker` with a custom CSS theme matching the app's rose/pink color scheme (`#bd3952`)

## Hardware Integration

### ANPR Entry Flow (correct order)

1. GPIO button (GPIO17) pressed → camera captures frame
2. RapidOCR (ONNX) reads license plate
3. RPi POSTs `{ plate }` to `POST /api/anpr/detect`
4. Backend decides:
   - Has valid reservation → marks `ACTIVE`, sets spot unavailable, emits Socket.IO, publishes MQTT `OPEN`
   - Walk-in with registered plate → creates Reservation + Payment, sets spot unavailable, publishes MQTT `OPEN`
   - Walk-in with unknown plate → sets spot unavailable, publishes MQTT `OPEN`
   - Parking full → publishes MQTT `DENY`, creates `DENIED` event
5. RPi receives HTTP response and:
   - `allowed: true` → publishes MQTT `OPEN` on `parking/bariera_intrare/command` + updates LCD display
   - `allowed: false` → publishes MQTT `DENY` on `parking/bariera_intrare/command`

Both the backend (`anprService`) and the RPi (`entry_trigger.py`) publish on the command topic — the RPi publishes **after** receiving the HTTP response, acting as confirmation to the physical barrier.

### MQTT Setup (two-machine workflow)

MQTT is disabled by default so development without hardware works out of the box.

| Machine | `.env` setting | Notes |
| ------- | -------------- | ----- |
| Development (no hardware) | `MQTT_ENABLED=false` | Server starts normally, `publishCommand` is a no-op |
| Hardware testing | `MQTT_ENABLED=true` | Requires Mosquitto broker running locally on port 1883 |

The `.env` file is in `.gitignore` — each machine keeps its own value.

### MQTT Topics

| Topic                             | Direction              | Purpose                                                 |
| --------------------------------- | ---------------------- | ------------------------------------------------------- |
| `parking/bariera_intrare/trigger` | RPi → Server           | Entry barrier trigger (barrierService path)             |
| `parking/bariera_iesire/trigger`  | RPi → Server           | Exit barrier trigger                                    |
| `parking/bariera_intrare/command` | Server / RPi → Barrier | OPEN / DENY command (both backend and RPi publish here) |
| `parking/display`                 | Server → RPi           | Display update (free spots, pricing)                    |

### AI Service (`ai-service/`)

A Python FastAPI placeholder for ANPR. Actual on-device OCR runs directly on the Raspberry Pi via `rapid_ocr.py`. The `ai-service` can be used for testing the recognition pipeline without hardware.

## Common Commands

```bash
# Database
npx prisma migrate dev         # Run migrations (use db push if migrate fails with P3006)
npx prisma db push             # Alternative to migrate dev — safe for schema sync
npx prisma db seed             # Seed initial data (run from server/)
npx prisma studio              # Open Prisma Studio GUI

# Root workspace
npm run dev:client
npm run dev:server
```
