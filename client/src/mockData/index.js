import { Bell, CalendarCheck, CarFront, CircleDollarSign, TimerReset, Users } from "lucide-react";

export const landingFeatures = [
  {
    title: "Real-time visibility",
    description: "See every parking spot update live - no refreshing, no guessing. Green means go.",
    icon: Bell
  },
  {
    title: "Reserve in seconds",
    description: "Pick your spot, confirm your booking, and get a QR code sent instantly to your phone.",
    icon: CalendarCheck
  },
  {
    title: "Built for everyone",
    description: "Designed for drivers, staff and administrators - with role-based access and admin dashboards included.",
    icon: Users
  }
];

export const liveStats = {
  availableSpots: 42,
  occupiedSpots: 78,
  occupancyRate: "65%",
  todayRevenue: "1,280 RON"
};

export const adminStats = [
  { label: "Total spots", value: "120", trend: "+4 this semester", icon: CarFront },
  { label: "Occupied spots", value: "78", trend: "Updated live", icon: TimerReset },
  { label: "Occupancy rate", value: "65%", trend: "Peak at 11:00", icon: Bell },
  { label: "Today revenue", value: "1,280 RON", trend: "+12% vs yesterday", icon: CircleDollarSign }
];

export const adminChartSeries = {
  revenue: [20, 35, 30, 48, 55, 80, 73],
  occupancy: [12, 22, 44, 66, 58, 48, 28]
};

export const recentActivities = [
  { type: "Reservation", title: "A-12 reserved by Andrei Pop", time: "2 min ago", status: "success" },
  { type: "Cancellation", title: "B-04 cancelled by Ioana D.", time: "10 min ago", status: "warning" },
  { type: "Entry", title: "Vehicle B-92-UNI entered via gate 1", time: "14 min ago", status: "info" },
  { type: "Conflict", title: "Spot C-07 occupied unexpectedly", time: "26 min ago", status: "danger" },
  { type: "No-show", title: "Reservation expired for D-11", time: "38 min ago", status: "warning" }
];

export const parkingSpots = [
  { id: "A1", number: 1, state: "occupied", price: "5 RON/h", user: "Andrei Pop", remainingTime: "01:25", plate: "B-92-UNI", restrictions: "EV priority" },
  { id: "A2", number: 2, state: "available", price: "5 RON/h", user: null, remainingTime: null, plate: null, restrictions: "Student" },
  { id: "A3", number: 3, state: "available", price: "4 RON/h", user: null, remainingTime: null, plate: null, restrictions: "None" },
  { id: "A4", number: 4, state: "reserved", price: "4 RON/h", user: "Maria I.", remainingTime: "Starts in 15m", plate: "CJ-11-PKS", restrictions: "Faculty staff" },
  { id: "B5", number: 5, state: "defective", price: "4 RON/h", user: null, remainingTime: null, plate: null, restrictions: "Maintenance" },
  { id: "B6", number: 6, state: "selected", price: "5 RON/h", user: null, remainingTime: null, plate: null, restrictions: "Covered" },
  { id: "B7", number: 7, state: "occupied", price: "5 RON/h", user: "Alex M.", remainingTime: "00:40", plate: "TM-04-AI", restrictions: "None" },
  { id: "B8", number: 8, state: "available", price: "6 RON/h", user: null, remainingTime: null, plate: null, restrictions: "Premium" },
  { id: "C9", number: 9, state: "available", price: "4 RON/h", user: null, remainingTime: null, plate: null, restrictions: "None" },
  { id: "C10", number: 10, state: "reserved", price: "6 RON/h", user: "Sorina C.", remainingTime: "Starts in 50m", plate: "IS-88-PAR", restrictions: "Premium" },
  { id: "C11", number: 11, state: "selected", price: "5 RON/h", user: null, remainingTime: null, plate: null, restrictions: "Near lab" },
  { id: "C12", number: 12, state: "available", price: "4 RON/h", user: null, remainingTime: null, plate: null, restrictions: "None" }
];

export const clientStats = [
  { label: "Total reservations", value: "24", trend: "Since account creation" },
  { label: "Active reservations", value: "1", trend: "Ends in 1h 25m" },
  { label: "Money spent", value: "154 RON", trend: "This month" },
  { label: "Saved vehicles", value: "2", trend: "1 default vehicle" }
];

export const notifications = [
  { title: "Reservation reminder", description: "Your spot A-12 starts in 15 minutes." },
  { title: "Campus traffic alert", description: "Main entrance is busy between 10:00 and 11:00." },
  { title: "Monthly summary", description: "You saved 5 minutes on average per booking this month." }
];

export const reservations = [
  { id: 1, section: "active", spot: "A-12", date: "24 Apr 2026", interval: "10:30 - 12:30", vehicle: "VW Golf", status: "Active", cost: "10 RON" },
  { id: 2, section: "upcoming", spot: "B-04", date: "25 Apr 2026", interval: "08:00 - 10:00", vehicle: "Skoda Fabia", status: "Upcoming", cost: "8 RON" },
  { id: 3, section: "past", spot: "C-07", date: "20 Apr 2026", interval: "09:00 - 11:00", vehicle: "VW Golf", status: "Completed", cost: "8 RON" },
  { id: 4, section: "cancelled", spot: "A-03", date: "17 Apr 2026", interval: "14:00 - 16:00", vehicle: "Skoda Fabia", status: "Cancelled", cost: "0 RON" }
];

export const vehicles = [
  { id: 1, label: "Campus Car", plate: "B-92-UNI", isDefault: true },
  { id: 2, label: "Home Car", plate: "CJ-11-PKS", isDefault: false }
];

export const devices = [
  { id: 1, name: "North Gate Barrier", type: "Barrier", status: "Online", uptime: "99.8%", errors: ["No critical issues in last 7 days"] },
  { id: 2, name: "Level 1 Sensor Hub", type: "Sensor", status: "Needs calibration", uptime: "96.1%", errors: ["Calibration drift detected", "Signal latency peak on Apr 22"] },
  { id: 3, name: "Entry Camera", type: "Camera", status: "Online", uptime: "98.9%", errors: ["Night OCR confidence dropped below threshold"] },
  { id: 4, name: "East Wing Sensor", type: "Sensor", status: "Offline", uptime: "81.5%", errors: ["Power interruption", "Packet loss from gateway"] }
];

export const reports = [
  { title: "Occupancy by hour", value: "Peak: 11:00 - 13:00", description: "Average occupancy is highest around lunch break." },
  { title: "Average duration", value: "1h 42m", description: "Most bookings stay under two hours." },
  { title: "Monthly revenue", value: "24,600 RON", description: "Revenue has grown steadily for three months." },
  { title: "New vs returning", value: "38% / 62%", description: "Returning users remain the dominant segment." },
  { title: "Issue reports", value: "12 this month", description: "Mostly cancellations and no-shows." }
];

export const menuByRole = {
  ADMIN: [
    { label: "Dashboard", path: "/admin" },
    { label: "Live Map", path: "/admin/live-map" },
    { label: "Hardware", path: "/admin/hardware" },
    { label: "Reports", path: "/admin/reports" }
  ],
  CLIENT: [
    { label: "Dashboard", path: "/client" },
    { label: "Parking", path: "/client/parking" },
    { label: "Reservations", path: "/client/reservations" },
    { label: "Vehicles", path: "/client/vehicles" },
    { label: "Profile", path: "/client/profile" }
  ]
};
