export const mockUsers = [
  { id: "u1", name: "Admin User", email: "admin@parking.com", role: "ADMIN" },
  { id: "u2", name: "Client User", email: "client@parking.com", role: "CLIENT" }
];

export const mockVehicles = [
  { id: "v1", label: "Campus Car", licensePlate: "B-92-UNI", isDefault: true, userId: "u2" },
  { id: "v2", label: "Home Car", licensePlate: "CJ-11-PKS", isDefault: false, userId: "u2" }
];

export const mockParkingSpots = [
  { id: "ps1", code: "A-12", status: "occupied", pricePerHour: 5, currentPlate: "B-92-UNI" },
  { id: "ps2", code: "B-04", status: "reserved", pricePerHour: 4, currentPlate: null },
  { id: "ps3", code: "C-07", status: "available", pricePerHour: 4, currentPlate: null }
];

export const mockReservations = [
  { id: "r1", spotId: "ps1", userId: "u2", status: "ACTIVE", totalCost: 10, startTime: "2026-04-24T10:30:00Z", endTime: "2026-04-24T12:30:00Z" },
  { id: "r2", spotId: "ps2", userId: "u2", status: "UPCOMING", totalCost: 8, startTime: "2026-04-25T08:00:00Z", endTime: "2026-04-25T10:00:00Z" }
];

export const mockPayments = [
  { id: "pay1", reservationId: "r1", amount: 10, status: "PAID", method: "CARD" }
];

export const mockHardware = [
  { id: "d1", name: "North Gate Barrier", type: "BARRIER", status: "ONLINE", uptime: 99.8 },
  { id: "d2", name: "Entry Camera", type: "CAMERA", status: "ONLINE", uptime: 98.9 }
];

export const mockParkingEvents = [
  { id: "e1", eventType: "ENTRY", description: "Vehicle B-92-UNI entered via Gate 1", createdAt: "2026-04-24T08:20:00Z" },
  { id: "e2", eventType: "CONFLICT", description: "Unexpected occupancy at C-07", createdAt: "2026-04-24T09:14:00Z" }
];

export const mockNotifications = [
  { id: "n1", userId: "u2", title: "Reservation reminder", message: "Your booking begins in 15 minutes." }
];

export const mockReports = {
  occupancy: { hour: 65, day: 61, month: 58 },
  durationAverageMinutes: 102,
  revenue: { daily: 1280, monthly: 24600 },
  userSplit: { newUsers: 38, returningUsers: 62 },
  issues: { noShows: 4, cancellations: 6, conflicts: 2 }
};
