# SmartPark — CLAUDE.md

## What is this project?

SmartPark is a smart parking system that combines a **web application** with a **physical scale model (machetă)**. The model simulates a real parking lot and is controlled/monitored in real time by the web app.

---

## Hardware Setup

### Brain
- **Raspberry Pi 5 (8GB RAM)** — central hub for all hardware
  - Runs the MQTT broker (Mosquitto)
  - Reads HC-SR04 ultrasonic sensors
  - Runs the Python ANPR script (OpenCV + Tesseract) on the camera feed
  - Controls the entry/exit barriers (servo motors)
  - Communicates with backend via MQTT and HTTP POST

### ESP32
- Controls all **WS2812B RGB LEDs** (one per parking spot + path guide LEDs)
- Receives LED commands from backend via MQTT
- LED colors per spot:
  - 🟢 Green = FREE
  - 🟡 Yellow = RESERVED
  - 🔴 Red = OCCUPIED
  - 🔵 Blue = DEFECTIVE

### Sensors — HC-SR04 Ultrasonic
- **12 total sensors:**
  - 10 for parking spots (detect if a car is present)
  - 2 for barriers (detect when to raise/lower)
- Polling interval: ≤2 seconds
- Connected to Raspberry Pi 5

### Barriers
- **2 barriers total:** entry + exit
- Controlled by servo motors (SG90/MG90) via RPi5
- Entry barrier opens automatically when ANPR validates a plate
- Exit barrier opens when sensor detects car leaving

### Per-spot barriers
- Each of the 10 parking spots also has its own small barrier
- Lowers when a spot is reserved via the app (to block it physically)
- Raises when the reservation is cancelled or expires

### PCA9685 — PWM Servo Controller
- **All 12 servo motors are controlled via a PCA9685 PWM driver board**
- Connected to RPi5 via **I2C** (SDA/SCL pins)
- Handles PWM signal generation for all servos, freeing RPi5 GPIO
- 12 channels used: 10 per-spot barriers + 1 entry barrier + 1 exit barrier
- Default I2C address: `0x40`
- Library: `adafruit-circuitpython-pca9685` on RPi5
- PWM frequency set to **50Hz** (standard for servo motors)

### Camera (ANPR)
- Positioned at entry
- Reads license plates using Python + OpenCV + Tesseract OCR
- Sends recognized plate to backend via `HTTP POST /api/anpr/detect`

### LED Path Guide
- WS2812B LEDs on the floor/path light up to guide a driver to their reserved spot
- Controlled by ESP32 on MQTT command from backend

---

## Communication Architecture

```
Browser / Mobile
      ↕ HTTPS + WebSocket (Socket.io)
API Backend (Node.js + Express)
      ↕ MQTT (publish/subscribe)
Raspberry Pi 5
      ↕ GPIO / Serial
Sensors, Servos, Camera
      ↕ MQTT (LED commands)
ESP32 → WS2812B LEDs
```

**RPi5 never communicates directly with the browser.** All data flows through the backend.

### MQTT Topics
| Topic | Direction | Description |
|-------|-----------|-------------|
| `smartpark/sensor/{spotId}/status` | RPi5 → Backend | `{"occupied": true/false, "timestamp": "..."}` |
| `smartpark/led/{spotId}/set` | Backend → ESP32 | `{"color": "GREEN"}` |
| `smartpark/barrier/entry/cmd` | Backend → RPi5 | `{"action": "open"}` |
| `smartpark/barrier/exit/cmd` | Backend → RPi5 | `{"action": "open"}` |
| `smartpark/spot/{spotId}/barrier/cmd` | Backend → RPi5 | `{"action": "lower"}` per-spot barrier |
| `smartpark/heartbeat` | RPi5 → Backend | Alive signal every ≤30s |

---

## Tech Stack

### Frontend
- React + TypeScript
- Tailwind CSS
- Framer Motion (animations — car moving to spot, LED animations)
- React Router
- Socket.io client (live map updates)

### Backend
- Node.js + Express
- Socket.io (WebSocket for real-time browser updates)
- MQTT client (subscribes to RPi5 topics)
- JWT authentication + RBAC (CLIENT / ADMIN roles)
- REST API

### Database
- PostgreSQL
- Prisma ORM

### AI / Computer Vision
- Python + OpenCV + Tesseract OCR (runs on RPi5)
- Sends plate string to backend via HTTP POST

### Infrastructure
- MQTT Broker: Mosquitto (runs on RPi5)
- Docker Compose (backend + DB containerized)
- nginx reverse proxy

---

## Roles & Actors

| Role | Description |
|------|-------------|
| **Vizitator** | Unauthenticated — sees landing page + live availability |
| **Client** | Registered user — reserves spots, manages vehicles, views history |
| **Admin** | Parking operator — full monitoring, hardware control, reports |
| **RPi5** | Hardware actor — publishes sensor data, receives barrier/LED commands |

---

## Parking Spot States (SpotStatus)

```
FREE → RESERVED (user reserves via app → spot barrier lowers)
RESERVED → OCCUPIED (car arrives, ANPR confirms → entry barrier opens)
OCCUPIED → FREE (car leaves, sensor detects → exit barrier opens)
FREE / OCCUPIED → DEFECTIVE (admin marks defective)
DEFECTIVE → FREE (admin marks repaired)
RESERVED → FREE (reservation cancelled or expired → spot barrier raises)
```

## Reservation States (ReservationStatus)

```
PENDING → ACTIVE (car arrives, ANPR confirmed)
ACTIVE → COMPLETED (car leaves)
PENDING → CANCELLED (user cancels)
ACTIVE → CANCELLED (admin force-releases)
ACTIVE → NO_SHOW (timeout, car never arrived)
```

---

## Key Data Models

```typescript
User { id, name, email, phone, role: CLIENT|ADMIN, passwordHash }
Vehicle { id, licensePlate, label, isDefault, ownerId }
ParkingSpot { id, spotNumber, section, status: SpotStatus, pricePerHour, sensorId }
Reservation { id, userId, spotId, vehicleId, startTime, endTime, status, totalCost }
Payment { id, reservationId, amount, method, status }
IoTDevice { id, type: SENSOR|BARRIER|CAMERA, status, lastSeen, errorLog }
Notification { id, userId, type, message, isRead }
Report { id, type: OCCUPANCY|FINANCIAL|USERS|ISSUES, period, data }
```

---

## API Endpoints (key ones)

```
POST   /api/auth/login
POST   /api/auth/signup
GET    /api/spots/availability
POST   /api/reservations
PATCH  /api/reservations/:id/cancel
PATCH  /api/reservations/:id/extend
GET    /api/reservations (user's own)
GET    /api/vehicles
POST   /api/vehicles
POST   /api/anpr/detect           ← called by RPi5 Python script
GET    /api/admin/dashboard
GET    /api/admin/spots/live
POST   /api/admin/spots/:id/force-release
POST   /api/admin/spots/:id/mark-defective
GET    /api/admin/devices
POST   /api/admin/devices/:id/restart
GET    /api/admin/reports/:type
```

---

## Frontend Pages

### Client
- `/` — Landing page (live spot count, CTA)
- `/login`, `/signup`
- `/dashboard` — Active reservation status, quick actions
- `/map` — Interactive parking map, car animation to reserved spot
- `/reserve` — Pick spot, vehicle, time range, see cost estimate
- `/reservations` — Active / upcoming / past / cancelled
- `/vehicles` — Manage vehicles (add, edit, delete, set default)
- `/profile` — Edit personal info, change password

### Admin
- `/admin/dashboard` — KPIs (total spots, occupied %, revenue today), charts
- `/admin/map` — Live map with color-coded spots, click for details + quick actions
- `/admin/hardware` — Device list, uptime, error logs, restart/calibrate
- `/admin/reports` — Occupancy, financial, user stats

---

## Non-Functional Requirements

| Metric | Target |
|--------|--------|
| API response time | <300ms (p95) |
| Live map update latency | <2s from sensor event |
| Uptime | ≥99.5% monthly |
| Concurrent users | ≥200 |
| Sensor polling | ≤2s per spot |
| Hardware offline alert | >30s no heartbeat → admin alert |
| Min screen width | 320px (mobile responsive) |

---

## Project Structure (intended)

```
smartpark/
├── frontend/               # React app
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   └── hooks/          # useSocket, useReservation, etc.
├── backend/                # Node.js + Express
│   ├── src/
│   │   ├── routes/
│   │   ├── services/
│   │   │   ├── mqttService.ts
│   │   │   ├── parkingService.ts
│   │   │   └── notificationService.ts
│   │   └── prisma/
├── hardware/               # RPi5 Python scripts
│   ├── sensor_reader.py    # HC-SR04 polling → MQTT publish
│   ├── anpr.py             # OpenCV + Tesseract → HTTP POST
│   └── barrier_control.py  # MQTT subscribe → servo control
├── esp32/                  # ESP32 Arduino/MicroPython
│   └── led_controller/     # MQTT subscribe → WS2812B control
├── docker-compose.yml
└── CLAUDE.md
```

---

## Common Commands

```bash
# Backend
cd backend && npm run dev

# Frontend
cd frontend && npm run dev

# Database migrations
cd backend && npx prisma migrate dev

# Prisma Studio (DB GUI)
cd backend && npx prisma studio

# Docker (full stack)
docker-compose up

# RPi5 — start sensor reader
python3 hardware/sensor_reader.py

# RPi5 — start ANPR
python3 hardware/anpr.py
```

---

## Important Implementation Notes

- **RPi5 controls all 12 servos via a PCA9685 PWM board over I2C** — NOT directly via GPIO PWM
- **ESP32 handles ALL LEDs** — RPi5 does NOT directly control WS2812B LEDs
- **RPi5 handles ALL sensors and barriers** — ESP32 does NOT read HC-SR04
- **12 HC-SR04 sensors total:** 10 spots + 2 barriers
- **Each parking spot has its own small barrier** that lowers when reserved
- **ANPR is the entry trigger** — barrier only opens after plate is recognized and matched to an active reservation
- **WebSocket is browser-only** — RPi5 uses MQTT exclusively
- **MQTT broker runs on RPi5** — backend connects to it as a client
- **Heartbeat monitoring** — if RPi5 goes silent >30s, admin gets an alert automatically
- **LED path guide** — when a user parks, floor LEDs light up to guide them to their spot (ESP32 controlled)