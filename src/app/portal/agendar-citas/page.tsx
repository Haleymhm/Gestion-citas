"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Pet {
  id: number;
  name: string;
  species: string;
  breed: string | null;
}

interface Category {
  id: string;
  name: string;
  color: string;
}

interface Appointment {
  id: number;
  date: string;
  reason: string;
  categoryId: string;
  category: Category | null;
  status: string;
  pet: {
    id: number;
    name: string;
  };
  vet: {
    firstName: string;
    lastName: string;
  } | null;
}

const statusLabels: Record<string, string> = {
  PENDING: "Pendiente de confirmación",
  CONFIRMED: "Confirmada",
  COMPLETED: "Completada",
  CANCELLED: "Cancelada",
  NO_SHOW: "No asistida",
};

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  CONFIRMED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  COMPLETED: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
  CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  NO_SHOW: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
};

export default function AgendarCitasPage() {
  const router = useRouter();
  const [pets, setPets] = useState<Pet[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    petId: "",
    date: "",
    time: "",
    categoryId: "",
    reason: "",
    notes: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [petsRes, apptsRes, categoriesRes] = await Promise.all([
        fetch("/api/v1/pets"),
        fetch("/api/v1/appointments"),
        fetch("/api/v1/categories"),
      ]);

      const petsData = await petsRes.json();
      const apptsData = await apptsRes.json();
      const categoriesData = await categoriesRes.json();

      if (petsData.success) {
        setPets(petsData.data.data || []);
      }

      if (apptsData.success) {
        setAppointments(apptsData.data || []);
      }

      if (categoriesData.success && categoriesData.data.length > 0) {
        setCategories(categoriesData.data);
        setForm((prev) => ({ ...prev, categoryId: categoriesData.data[0].id }));
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.petId || !form.date || !form.time || !form.reason) {
      alert("Por favor complete todos los campos requeridos");
      return;
    }

    const dateTime = `${form.date}T${form.time}:00.000Z`;

    try {
      const res = await fetch("/api/v1/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: dateTime,
          reason: form.reason,
          categoryId: form.categoryId,
          petId: parseInt(form.petId),
          notes: form.notes || null,
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert("Cita solicitada exitosamente. Recibirá un email cuando sea confirmada.");
        setShowForm(false);
        setForm({ petId: "", date: "", time: "", categoryId: categories[0]?.id || "", reason: "", notes: "" });
        fetchData();
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error("Error creating appointment:", error);
      alert("Error al solicitar la cita");
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("es-ES", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
            Agendar Cita
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Solicita una nueva cita para tu mascota
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600"
        >
          {showForm ? "Cancelar" : "+ Nueva Cita"}
        </button>
      </div>

      {showForm && (
        <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-boxdark dark:border-gray-800">
          <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
            Solicitar Nueva Cita
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-400">
                Mascota *
              </label>
              <select
                value={form.petId}
                onChange={(e) => setForm({ ...form, petId: e.target.value })}
                required
                className="w-full px-4 py-2.5 text-sm border rounded-lg bg-white dark:bg-boxdark border-gray-300 dark:border-strokedark"
              >
                <option value="">Selecciona una mascota</option>
                {pets.map((pet) => (
                  <option key={pet.id} value={pet.id}>
                    {pet.name} ({pet.species})
                  </option>
                ))}
              </select>
              {pets.length === 0 && (
                <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                  Primero debes registrar una mascota
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-400">
                  Fecha *
                </label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  min={new Date().toISOString().split("T")[0]}
                  required
                  className="w-full px-4 py-2.5 text-sm border rounded-lg bg-white dark:bg-boxdark border-gray-300 dark:border-strokedark"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-400">
                  Hora *
                </label>
                <select
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 text-sm border rounded-lg bg-white dark:bg-boxdark border-gray-300 dark:border-strokedark"
                >
                  <option value="">Selecciona una hora</option>
                  {[
                    "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
                    "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
                    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
                    "17:00", "17:30", "18:00", "18:30", "19:00", "19:30",
                  ].map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-400">
                Categoría *
              </label>
              <select
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                required
                className="w-full px-4 py-2.5 text-sm border rounded-lg bg-white dark:bg-boxdark border-gray-300 dark:border-strokedark"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-400">
                Motivo de consulta *
              </label>
              <select
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                required
                className="w-full px-4 py-2.5 text-sm border rounded-lg bg-white dark:bg-boxdark border-gray-300 dark:border-strokedark"
              >
                <option value="">Selecciona el motivo</option>
                <option value="Consulta general">Consulta general</option>
                <option value="Vacunación">Vacunación</option>
                <option value="Desparasitación">Desparasitación</option>
                <option value="Revisión post-tratamiento">Revisión post-tratamiento</option>
                <option value="Cirugía">Cirugía</option>
                <option value="Emergencia">Emergencia</option>
                <option value="Laboratorio">Análisis de laboratorio</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-400">
                Notas adicionales
              </label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={3}
                placeholder="Describe los síntomas o cualquier información relevante..."
                className="w-full px-4 py-2.5 text-sm border rounded-lg bg-white dark:bg-boxdark border-gray-300 dark:border-strokedark"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setForm({ petId: "", date: "", time: "", categoryId: categories[0]?.id || "", reason: "", notes: "" });
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 dark:text-gray-400 dark:border-strokedark"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600"
              >
                Solicitar Cita
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-boxdark dark:border-gray-800">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <h3 className="font-semibold text-gray-800 dark:text-white/90">
            Mis Citas
          </h3>
        </div>
        <div className="p-4">
          {appointments.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No tienes citas agendadas. Solicita una nueva cita.
            </p>
          ) : (
            <div className="space-y-4">
              {appointments.map((apt) => (
                <div
                  key={apt.id}
                  className="flex items-center justify-between p-4 border border-gray-100 rounded-lg dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/5"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">
                        {apt.status === "PENDING" && "⏳"}
                        {apt.status === "CONFIRMED" && "✅"}
                        {apt.status === "COMPLETED" && "✓"}
                        {apt.status === "CANCELLED" && "✗"}
                        {apt.status === "NO_SHOW" && "⚠"}
                      </span>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className="px-2 py-0.5 text-xs font-medium rounded-full"
                            style={{
                              backgroundColor: `${apt.category?.color || "#6b7280"}20`,
                              color: apt.category?.color || "#6b7280",
                            }}
                          >
                            {apt.category?.name || "Sin categoría"}
                          </span>
                        </div>
                        <p className="font-medium text-gray-800 dark:text-white/90">
                          {apt.reason}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {apt.pet?.name} • {formatDate(apt.date)}
                        </p>
                        {apt.vet && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Dr. {apt.vet.firstName} {apt.vet.lastName}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded-full ${
                      statusColors[apt.status] || "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {statusLabels[apt.status]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}