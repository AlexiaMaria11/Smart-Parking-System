# Smart Parking System

Modular full-stack starter for a university Smart Parking System project.

## Stack

- Frontend: React + Vite + Tailwind CSS + Framer Motion
- Backend: Node.js + Express + Socket.IO + Prisma
- Database: PostgreSQL
- AI placeholder: Python + OpenCV + Tesseract

## Structure

```text
client/      React application
server/      Express API + Prisma + Socket.IO
ai-service/  OCR placeholder service
```

## Run

1. Install dependencies in `client` and `server`
2. Configure `server/.env`
3. Run frontend with `npm run dev:client`
4. Run backend with `npm run dev:server`

## Notes

- Authentication and dashboard data use mock implementations for the starter.
- Prisma schema includes the main entities requested.
- Socket.IO is scaffolded for real-time parking spot updates.
