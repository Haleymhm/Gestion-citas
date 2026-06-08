"use client";
import React, { useState, useEffect } from "react";

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
}

const Calendar: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    setEvents([
      {
        id: "1",
        title: "Evento de ejemplo",
        start: new Date().toISOString().split("T")[0],
      },
    ]);
  }, []);

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)));
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)));
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(
      (event) => new Date(event.start).toDateString() === date.toDateString()
    );
  };

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const days = getDaysInMonth(currentMonth);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={prevMonth}
            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            Anterior
          </button>
          <button
            onClick={nextMonth}
            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            Siguiente
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((date, index) => (
          <div
            key={index}
            className={`min-h-20 border border-gray-100 dark:border-gray-800 p-1 ${
              date ? "bg-white dark:bg-gray-900" : "bg-gray-50 dark:bg-gray-800"
            }`}
          >
            {date && (
              <>
                <div
                  className={`text-sm font-medium mb-1 ${
                    isToday(date)
                      ? "text-brand-500 bg-brand-50 dark:bg-brand-900/20 rounded-full w-7 h-7 flex items-center justify-center"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {date.getDate()}
                </div>
                <div className="space-y-1">
                  {getEventsForDate(date).map((event) => (
                    <div
                      key={event.id}
                      className="text-xs p-1 bg-brand-50 text-brand-600 rounded dark:bg-brand-900/30 dark:text-brand-400 truncate"
                    >
                      {event.title}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Calendar;