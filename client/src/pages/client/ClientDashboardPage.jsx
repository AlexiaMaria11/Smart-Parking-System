import { useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useApi } from "../../hooks/useApi";
import { apiRequest } from "../../services/api";
import { PageHeader } from "../../components/layout/PageHeader";
import { StatCard } from "../../components/common/StatCard";
import { ChartPanel } from "../../components/dashboard/ChartPanel";
import { NotificationPanel } from "../../components/dashboard/NotificationPanel";
import { Button } from "../../components/common/Button";
import { useAuth } from "../../hooks/useAuth";
import "./ClientPages.css";

const pageVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.35, ease: "easeOut" } },
};

const gridVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
};

const panelVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 220, damping: 22 } },
};

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("ro-RO", { day: "2-digit", month: "short", year: "numeric" });
}

function formatInterval(start, end) {
  const fmt = (iso) =>
    new Date(iso).toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" });
  return `${fmt(start)} - ${fmt(end)}`;
}

export function ClientDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  const { data: reservations } = useApi(`/reservations?_=${refreshKey}`);
  const { data: payments } = useApi(`/payments?_=${refreshKey}`);
  const { data: vehicles } = useApi(`/vehicles?_=${refreshKey}`);
  const { data: notifications } = useApi(`/notifications?_=${refreshKey}`);

  const walkInPayments = (payments ?? []).filter(
    (p) => !p.reservationId && p.status === "PENDING"
  );

  const [actionState, setActionState] = useState({});

  const activeReservations = (reservations ?? []).filter((r) => r.status === "ACTIVE");

  function setResAction(id, patch) {
    setActionState((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  }
  const upcomingCount = (reservations ?? []).filter((r) => r.status === "UPCOMING").length;
  const totalCount = (reservations ?? []).length;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthlySpent = (reservations ?? [])
    .filter((r) => r.status === "COMPLETED" && new Date(r.createdAt) >= startOfMonth)
    .reduce((sum, r) => sum + Number(r.totalCost), 0);

  const statCards = [
    { label: "Total reservations", value: String(totalCount), trend: "Since account creation" },
    { label: "Upcoming", value: String(upcomingCount), trend: "Future reservations" },
    { label: "Spent this month", value: `${monthlySpent.toFixed(0)} RON`, trend: "Completed reservations" },
    {
      label: "Saved vehicles",
      value: String((vehicles ?? []).length),
      trend: `${(vehicles ?? []).filter((v) => v.isDefault).length} default`,
    },
  ];

  const notifItems = (notifications ?? []).map((n) => ({
    title: n.title,
    description: n.message,
    isRead: n.isRead,
  }));

  // Chart data computed from real reservations
  const chartData = useMemo(() => {
    const completed = (reservations ?? []).filter((r) => r.status === "COMPLETED");

    // parkingTime: last 7 completed reservations, duration in minutes
    const recent = [...completed].slice(0, 7).reverse();
    const parkingTimeValues = recent.map((r) =>
      Math.round((new Date(r.endTime) - new Date(r.startTime)) / 60000)
    );
    const parkingTimeLabels = recent.map((r) => r.parkingSpot?.code ?? "?");

    // spending: last 6 calendar months, sum of totalCost
    const monthlyMap = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      monthlyMap[key] = {
        label: d.toLocaleDateString("ro-RO", { month: "short" }),
        total: 0,
      };
    }
    completed.forEach((r) => {
      const d = new Date(r.endTime);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (monthlyMap[key]) monthlyMap[key].total += Number(r.totalCost);
    });
    const months = Object.values(monthlyMap);
    const spendingValues = months.map((m) => parseFloat(m.total.toFixed(2)));
    const spendingLabels = months.map((m) => m.label);

    const hasAnyData = parkingTimeValues.length > 0 || spendingValues.some((v) => v > 0);

    return {
      series: {
        parkingTime: parkingTimeValues.length > 0 ? parkingTimeValues : [0],
        spending: spendingValues,
      },
      labels: {
        parkingTime: parkingTimeLabels.length > 0 ? parkingTimeLabels : ["—"],
        spending: spendingLabels,
      },
      titles: {
        parkingTime: hasAnyData ? "Parking time — recent reservations (min)" : "Parking time — no data yet",
        spending: "Monthly spending (RON)",
      },
    };
  }, [reservations]);

  async function handlePay(reservation) {
    const payment = reservation.payments?.[0];
    if (!payment) return;
    const spotCode = reservation.parkingSpot?.code ?? "spot";
    const isWalkIn = Number(payment.amount) === 0;
    const msg = isWalkIn
      ? `Confirm payment for walk-in session on spot ${spotCode}? Amount will be calculated based on time parked.`
      : `Confirm payment of ${Number(payment.amount).toFixed(2)} RON for spot ${spotCode}?`;
    if (!window.confirm(msg)) return;
    setResAction(reservation.id, { payLoading: true, payError: null });
    try {
      await apiRequest(`/payments/${payment.id}/pay`, { method: "PATCH" });
      refresh();
    } catch (err) {
      setResAction(reservation.id, { payError: err.message || "Payment failed." });
    } finally {
      setResAction(reservation.id, { payLoading: false });
    }
  }

  async function handlePayWalkIn(payment) {
    if (!window.confirm(`Confirm payment for walk-in on spot ${payment.parkingSpot?.code ?? "?"}? Amount will be calculated based on time parked.`)) return;
    setResAction(payment.id, { payLoading: true, payError: null });
    try {
      await apiRequest(`/payments/${payment.id}/pay`, { method: "PATCH" });
      refresh();
    } catch (err) {
      setResAction(payment.id, { payError: err.message || "Payment failed." });
    } finally {
      setResAction(payment.id, { payLoading: false });
    }
  }

  async function handleCancel(reservation) {
    if (!window.confirm(`Cancel reservation for spot ${reservation.parkingSpot?.code}?`)) return;
    setResAction(reservation.id, { cancelLoading: true, cancelError: null });
    try {
      await apiRequest(`/reservations/${reservation.id}/cancel`, { method: "PATCH" });
      refresh();
    } catch (err) {
      setResAction(reservation.id, { cancelError: err.message || "Failed to cancel." });
    } finally {
      setResAction(reservation.id, { cancelLoading: false });
    }
  }

  return (
    <motion.div variants={pageVariants} initial="hidden" animate="visible">
      <PageHeader
        title={`Welcome, ${user?.name || "Client"}`}
        description="Manage your active reservation, vehicles and parking activity."
        action={
          <div className="client-header-actions">
            <Button onClick={() => navigate("/client/parking")}>Find Parking</Button>
            <Button variant="secondary" onClick={() => navigate("/client/reservations")}>
              View Reservations
            </Button>
            <Button variant="secondary" onClick={() => navigate("/client/vehicles")}>
              My Vehicles
            </Button>
          </div>
        }
      />
      <motion.div className="client-stats-grid" variants={gridVariants} initial="hidden" animate="visible">
        {statCards.map((item, i) => (
          <StatCard key={item.label} {...item} delay={i * 0.06} />
        ))}
      </motion.div>
      <motion.div
        className="client-dashboard-grid"
        variants={panelVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.35 }}
      >
        <div className="client-stack">
          <div className="client-status-panel">
            <p className="client-panel-eyebrow">Active reservations</p>
            {activeReservations.length === 0 ? (
              <p className="client-empty-copy">No active reservations at the moment.</p>
            ) : (
              <div className="client-active-list">
                {activeReservations.map((r) => {
                  const payment = r.payments?.[0] ?? null;
                  const s = actionState[r.id] ?? {};
                  return (
                    <div key={r.id} className="client-active-item">
                      <div className="client-active-header">
                        <div>
                          <p className="client-current-status">{r.status}</p>
                          <h3 className="client-current-spot">{r.parkingSpot?.code}</h3>
                        </div>
                        {payment && (
                          <span className={payment.status === "PAID" ? "payment-badge-paid" : "payment-badge-pending"}>
                            {payment.status === "PAID" ? "Paid ✓" : "Pending"}
                          </span>
                        )}
                      </div>
                      <div className="client-current-details">
                        <p><span>Interval:</span> {formatInterval(r.startTime, r.endTime)}</p>
                        <p><span>Vehicle:</span> {r.vehicle?.label}</p>
                        <p>
                          <span>Cost:</span>{" "}
                          {Number(r.totalCost) === 0
                            ? "Calculated at payment"
                            : `${Number(r.totalCost).toFixed(2)} RON`}
                        </p>
                      </div>
                      {s.payError && <p className="entity-card-error">{s.payError}</p>}
                      {s.cancelError && <p className="entity-card-error">{s.cancelError}</p>}
                      <div className="client-current-actions">
                        {payment?.status === "PENDING" && (
                          <Button onClick={() => handlePay(r)} disabled={s.payLoading}>
                            {s.payLoading
                              ? "Processing..."
                              : `Pay${Number(payment.amount) > 0 ? ` ${Number(payment.amount).toFixed(2)} RON` : ""}`}
                          </Button>
                        )}
                        <Button
                          variant="secondary"
                          onClick={() => handleCancel(r)}
                          disabled={s.cancelLoading || payment?.status === "PAID"}
                        >
                          {s.cancelLoading ? "Cancelling..." : "Cancel"}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          {walkInPayments.length > 0 && (
            <div className="client-status-panel">
              <p className="client-panel-eyebrow">Walk-in sessions</p>
              <div className="client-active-list">
                {walkInPayments.map((p) => {
                  const s = actionState[p.id] ?? {};
                  return (
                    <div key={p.id} className="client-active-item">
                      <div className="client-active-header">
                        <div>
                          <p className="client-current-status">WALK-IN</p>
                          <h3 className="client-current-spot">{p.parkingSpot?.code ?? "—"}</h3>
                        </div>
                        <span className="payment-badge-pending">Pending</span>
                      </div>
                      <div className="client-current-details">
                        <p><span>Vehicle:</span> {p.vehicle?.label ?? p.vehicle?.licensePlate ?? "—"}</p>
                        <p><span>Cost:</span> Calculated at payment</p>
                      </div>
                      {s.payError && <p className="entity-card-error">{s.payError}</p>}
                      <div className="client-current-actions">
                        <Button onClick={() => handlePayWalkIn(p)} disabled={s.payLoading}>
                          {s.payLoading ? "Processing..." : "Pay"}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <ChartPanel
            series={chartData.series}
            labels={chartData.labels}
            titles={chartData.titles}
            buttonLabels={{ parkingTime: "Parking time", spending: "Spending" }}
            formatters={{
              parkingTime: (value) => `${value} min`,
              spending: (value) => `${value} RON`,
            }}
            eyebrow="My activity"
          />
        </div>
        <NotificationPanel notifications={notifItems} />
      </motion.div>
    </motion.div>
  );
}
