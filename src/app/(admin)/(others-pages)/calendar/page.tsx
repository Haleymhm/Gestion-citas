import { Metadata } from "next";
import Calendar from "@/components/calendar/Calendar";

export const metadata: Metadata = {
  title: "Calendario | VeteriApp Gestión Integral Veterinaria",
  description: "Calendario de citas de la veterinaria",
};

export default function CalendarPage() {
  return (
    <div>
      <h2 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white/90">
        Calendario de Citas
      </h2>
      <Calendar />
    </div>
  );
}