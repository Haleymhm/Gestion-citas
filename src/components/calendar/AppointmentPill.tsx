"use client";

import { useState } from "react";

interface AppointmentPillProps {
  status: string;
  categoryColor: string;
  size?: "sm" | "md";
}

const statusConfig: Record<string, { label: string; color: string; pulse: boolean }> = {
  PENDING:    { label: "Pendiente",    color: "#EF4444", pulse: true  },
  CONFIRMED:  { label: "Confirmada",   color: "#10B981", pulse: false },
  COMPLETED:  { label: "Completada",   color: "#6B7280", pulse: false },
  CANCELLED:  { label: "Cancelada",    color: "#94A3B8", pulse: false },
  NO_SHOW:    { label: "No asistió",   color: "#8B5CF6", pulse: false },
};

export default function AppointmentPill({
  status,
  categoryColor,
  size = "sm",
}: AppointmentPillProps) {
  const [showLabel, setShowLabel] = useState(false);

  const config = statusConfig[status] ?? { label: status, color: "#6B7280", pulse: false };

  const pillSize = size === "sm" ? "w-2 h-2" : "w-2.5 h-2.5";
  const gap = size === "sm" ? "gap-1.5" : "gap-2";

  return (
    <div className={`flex items-center ${gap}`}>
      {/* Píldora de color de categoría */}
      <span
        className={`${pillSize} rounded-full border-2`}
        style={{ borderColor: categoryColor, backgroundColor: `${categoryColor}20` }}
        aria-label={`Categoría: ${status}`}
      />

      {/* Indicador de estado (luz de tráfico) */}
      <div className="relative flex items-center">
        <span
          className={`${pillSize} rounded-full ${config.pulse ? "animate-pulse" : ""}`}
          style={{ backgroundColor: config.color }}
          onMouseEnter={() => setShowLabel(true)}
          onMouseLeave={() => setShowLabel(false)}
          onFocus={() => setShowLabel(true)}
          onBlur={() => setShowLabel(false)}
          tabIndex={0}
          role="img"
          aria-label={`Estado: ${config.label}`}
        />
        {showLabel && (
          <span
            className="absolute left-1/2 -translate-x-1/2 bottom-5 whitespace-nowrap px-2 py-1 text-xs font-medium rounded-md shadow-lg pointer-events-none z-50"
            style={{
              backgroundColor: "#1A1A1A",
              color: "#FFFFFF",
              fontSize: "0.6875rem",
            }}
          >
            {config.label}
          </span>
        )}
      </div>
    </div>
  );
}