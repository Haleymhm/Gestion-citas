"use client";

import { useMemo } from "react";
import { useCalendarContext } from "./CalendarContext";
import AppointmentPill from "./AppointmentPill";
import styles from "./CalendarSidePanel.module.css";

export default function CalendarSidePanel() {
  const { appointments, setShowCreateModal, setShowPendingModal, pendingCount } = useCalendarContext();

  const todayStats = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

    const todayAppts = appointments.filter((apt) => {
      const aptDate = new Date(apt.date);
      return aptDate >= todayStart && aptDate < todayEnd;
    });

    return {
      total: todayAppts.length,
      confirmed: todayAppts.filter((a) => a.status === "CONFIRMED").length,
      pending: todayAppts.filter((a) => a.status === "PENDING").length,
    };
  }, [appointments]);

  const nextAppointment = useMemo(() => {
    const now = new Date();
    const confirmedAppts = appointments
      .filter((apt) => {
        const aptDate = new Date(apt.date);
        return apt.status === "CONFIRMED" && aptDate >= now;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return confirmedAppts[0] || null;
  }, [appointments]);

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <aside className={styles.sidePanel}>
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Resumen del Día</h3>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>{todayStats.total}</span>
            <span className={styles.statLabel}>Total</span>
          </div>
          <div className={`${styles.statCard} ${styles.confirmed}`}>
            <span className={styles.statNumber}>{todayStats.confirmed}</span>
            <span className={styles.statLabel}>Confirmadas</span>
          </div>
          <div className={`${styles.statCard} ${styles.pending}`}>
            <span className={styles.statNumber}>{todayStats.pending}</span>
            <span className={styles.statLabel}>Pendientes</span>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Próxima Cita</h3>
        {nextAppointment ? (
          <div className={styles.nextAppointmentCard}>
            <div className={styles.nextAppointmentHeader}>
              <AppointmentPill
                status={nextAppointment.status}
                categoryColor={nextAppointment.category?.color || "#6b7280"}
                size="sm"
              />
              <span className={styles.nextAppointmentTime}>
                {formatTime(nextAppointment.date)}
              </span>
            </div>
            <p className={styles.nextAppointmentPet}>{nextAppointment.pet?.name}</p>
            <p className={styles.nextAppointmentCategory}>
              {nextAppointment.category?.name}
            </p>
            <p className={styles.nextAppointmentOwner}>
              {nextAppointment.pet?.owner?.firstName} {nextAppointment.pet?.owner?.lastName}
            </p>
            <p className={styles.nextAppointmentReason}>{nextAppointment.reason}</p>
          </div>
        ) : (
          <p className={styles.emptyState}>No hay citas confirmadas próximas</p>
        )}
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Atajos Rápidos</h3>
        <div className={styles.quickActions}>
          <button
            onClick={() => setShowCreateModal(true)}
            className={styles.quickActionBtn}
          >
            <svg className={styles.quickActionIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Agregar Cita
          </button>
          <button
            onClick={() => setShowPendingModal(true)}
            className={`${styles.quickActionBtn} ${pendingCount > 0 ? styles.pendingBadge : ""}`}
          >
            <svg className={styles.quickActionIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Ver Pendientes
            {pendingCount > 0 && (
              <span className={styles.badge}>{pendingCount}</span>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}