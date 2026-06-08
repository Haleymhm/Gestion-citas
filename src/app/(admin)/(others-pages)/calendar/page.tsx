import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Calendario | VetAppoint",
  description: "Calendario de citas",
};

export default function CalendarPage() {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
        Calendario de Citas
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mt-4">
        Visualiza y gestiona el calendario de citas de la veterinaria.
      </p>
    </div>
  );
}