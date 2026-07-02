"use client";

import { useState, useCallback } from "react";
import Calendar, { CalendarProps, Appointment } from "./Calendar";
import CalendarSidePanel from "./CalendarSidePanel";
import { CalendarProvider, useCalendarContext } from "./CalendarContext";

function CalendarContent() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const { setShowCreateModal, setShowPendingModal } = useCalendarContext();

  const handleOpenCreateModal = useCallback(() => {
    setShowCreateModal(true);
  }, [setShowCreateModal]);

  const handleOpenPendingModal = useCallback(() => {
    setShowPendingModal(true);
  }, [setShowPendingModal]);

  const calendarProps: CalendarProps = {
    onOpenCreateModal: handleOpenCreateModal,
    onOpenPendingModal: handleOpenPendingModal,
    externalAppointments: appointments,
    setExternalAppointments: setAppointments,
  };

  return (
    <div className="relative">
      <div className="flex flex-col lg:flex-row gap-4 mb-16 lg:mb-0">
        <div className="flex-1 min-w-0">
          <Calendar {...calendarProps} />
        </div>
        <div className="hidden lg:block lg:w-[280px] lg:flex-shrink-0">
          <CalendarSidePanel />
        </div>
      </div>
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40">
        <CalendarSidePanel />
      </div>
    </div>
  );
}

export default function CalendarView() {
  return (
    <CalendarProvider>
      <CalendarContent />
    </CalendarProvider>
  );
}