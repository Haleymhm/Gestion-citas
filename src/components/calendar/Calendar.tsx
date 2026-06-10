"use client";

import { useEffect, useState, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { EventInput, DateSelectArg, EventClickArg } from "@fullcalendar/core";

interface Vet {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

interface Pet {
  id: number;
  name: string;
  species: string;
  owner: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface Appointment {
  id: number;
  date: string;
  reason: string;
  status: string;
  notes: string | null;
  petId: number;
  vetId: number | null;
  categoryId: string;
  pet: Pet;
  vet: Vet | null;
  category: {
    id: string;
    name: string;
    color: string;
  };
}

interface Category {
  id: string;
  name: string;
  color: string;
}

const statusColors: Record<string, string> = {
  PENDING: "#f59e0b",
  CONFIRMED: "#10b981",
  COMPLETED: "#6b7280",
  CANCELLED: "#ef4444",
  NO_SHOW: "#8b5cf6",
};

const statusLabels: Record<string, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmada",
  COMPLETED: "Completada",
  CANCELLED: "Cancelada",
  NO_SHOW: "No asistida",
};

export default function Calendar() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [vets, setVets] = useState<Vet[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [allPets, setAllPets] = useState<Pet[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const calendarRef = useRef<FullCalendar>(null);

  const [form, setForm] = useState({
    date: "",
    time: "",
    categoryId: "",
    reason: "",
    petId: "",
    vetId: "",
    notes: "",
  });

  useEffect(() => {
    fetchAppointments();
    fetchVets();
    fetchAllPets();
    fetchCategories();
  }, []);

  const fetchAllPets = async () => {
    try {
      const res = await fetch("/api/v1/pets");
      const data = await res.json();
      if (data.success) {
        setAllPets(data.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching pets:", error);
    }
  };

  const fetchCategories = async () => {
    console.log("fetchCategories called");
    try {
      const res = await fetch("/api/v1/categories");
      console.log("fetchCategories response status:", res.status);
      const data = await res.json();
      console.log("Categories response:", JSON.stringify(data));
      if (data.success) {
        setCategories(data.data || []);
        if (data.data && data.data.length > 0) {
          setForm((prev) => ({ ...prev, categoryId: data.data[0].id }));
        }
      } else {
        console.error("Categories API error:", data.error);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchAppointments = async () => {
    try {
      const res = await fetch("/api/v1/appointments");
      const data = await res.json();
      if (data.success) {
        setAppointments(data.data);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVets = async () => {
    try {
      const res = await fetch("/api/v1/vets");
      const data = await res.json();
      if (data.success) {
        setVets(data.data);
      }
    } catch (error) {
      console.error("Error fetching vets:", error);
    }
  };

  const events: EventInput[] = appointments.map((apt) => ({
    id: apt.id.toString(),
    title: `${apt.category?.name || "Sin categoría"}: ${apt.pet?.name} - ${apt.reason}`,
    start: apt.date,
    backgroundColor: `${apt.category?.color || "#6b7280"}30`,
    borderColor: apt.category?.color || "#6b7280",
    borderWidth: 3,
    extendedProps: {
      appointment: apt,
    },
  }));

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    resetForm();
    const dateStr = selectInfo.startStr.split("T")[0];
    const timeStr = selectInfo.startStr.split("T")[1]?.substring(0, 5) || "09:00";
    setForm((prev) => ({
      ...prev,
      date: dateStr,
      time: timeStr,
    }));
    setShowModal(true);
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const apt = clickInfo.event.extendedProps.appointment as Appointment;
    setSelectedAppointment(apt);
    setShowDetailModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const dateTime = `${form.date}T${form.time}:00.000Z`;

    const payload = {
      date: dateTime,
      reason: form.reason,
      categoryId: form.categoryId,
      petId: parseInt(form.petId),
      vetId: form.vetId ? parseInt(form.vetId) : null,
      notes: form.notes || null,
      status: "CONFIRMED",
    };

    try {
      const res = await fetch("/api/v1/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        fetchAppointments();
        setShowModal(false);
        resetForm();
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error("Error creating appointment:", error);
    }
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      const res = await fetch(`/api/v1/appointments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();

      if (data.success) {
        fetchAppointments();
        setShowDetailModal(false);
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error("Error updating appointment:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Está seguro de eliminar esta cita?")) return;

    try {
      const res = await fetch(`/api/v1/appointments/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success) {
        fetchAppointments();
        setShowDetailModal(false);
      }
    } catch (error) {
      console.error("Error deleting appointment:", error);
    }
  };

  const resetForm = () => {
    setForm({
      date: "",
      time: "",
      categoryId: categories[0]?.id || "",
      reason: "",
      petId: "",
      vetId: "",
      notes: "",
    });
  };

  const pendingCount = appointments.filter((a) => a.status === "PENDING").length;

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Cargando...</div>;
  }

  return (
    <div className="space-y-4">
      {pendingCount > 0 && (
        <div className="p-4 mb-4 bg-amber-50 border border-amber-200 rounded-lg dark:bg-amber-900/20 dark:border-amber-800">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            <strong>{pendingCount}</strong> cita{pendingCount > 1 ? "s" : ""} pendiente{pendingCount > 1 ? "s" : ""} de confirmar
          </p>
        </div>
      )}

      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxgray p-4">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          events={events}
          selectable={true}
          select={handleDateSelect}
          eventClick={handleEventClick}
          height="auto"
          locale="es"
          buttonText={{
            today: "Hoy",
            month: "Mes",
            week: "Semana",
            day: "Día",
          }}
        />
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg p-6 bg-white rounded-lg dark:bg-boxdark max-h-[90vh] overflow-y-auto">
            <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
              Nueva Cita
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-400">
                    Fecha *
                  </label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    required
                    className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-boxdark border-gray-300 dark:border-strokedark"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-400">
                    Hora *
                  </label>
                  <input
                    type="time"
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                    required
                    className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-boxdark border-gray-300 dark:border-strokedark"
                  />
                </div>
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-400">
                  Mascota *
                </label>
                <select
                  value={form.petId}
                  onChange={(e) => setForm({ ...form, petId: e.target.value })}
                  required
                  className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-boxdark border-gray-300 dark:border-strokedark"
                >
                  <option value="">Seleccionar mascota</option>
                  {allPets.map((pet) => (
                    <option key={pet.id} value={pet.id}>
                      {pet.name} ({pet.owner.firstName} {pet.owner.lastName})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-400">
                  Veterinario
                </label>
                <select
                  value={form.vetId}
                  onChange={(e) => setForm({ ...form, vetId: e.target.value })}
                  className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-boxdark border-gray-300 dark:border-strokedark"
                >
                  <option value="">Sin asignar</option>
                  {vets.map((vet) => (
                    <option key={vet.id} value={vet.id}>
                      Dr. {vet.firstName} {vet.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-400">
                  Categoría *
                </label>
                <select
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                  required
                  className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-boxdark border-gray-300 dark:border-strokedark"
                >
                  <option value="">Seleccionar categoría</option>
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
                <input
                  type="text"
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  required
                  placeholder="Ej: Revisión general, corte de pelo..."
                  className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-boxdark border-gray-300 dark:border-strokedark"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-400">
                  Notas adicionales
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-boxdark border-gray-300 dark:border-strokedark"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 dark:text-gray-400 dark:border-strokedark dark:hover:bg-white/5"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600"
                >
                  Crear Cita
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDetailModal && selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg p-6 bg-white rounded-lg dark:bg-boxdark">
            <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
              Detalle de Cita
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Estado:</span>
                <span
                  className="px-2 py-1 text-xs font-medium rounded-full"
                  style={{
                    backgroundColor: `${statusColors[selectedAppointment.status]}20`,
                    color: statusColors[selectedAppointment.status],
                  }}
                >
                  {statusLabels[selectedAppointment.status]}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Categoría:</span>
                <span
                  className="px-2 py-1 text-xs font-medium rounded-full"
                  style={{
                    backgroundColor: `${selectedAppointment.category?.color || "#6b7280"}20`,
                    color: selectedAppointment.category?.color || "#6b7280",
                  }}
                >
                  {selectedAppointment.category?.name || "Sin categoría"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Fecha:</span>
                <span className="text-sm text-gray-800 dark:text-white/90">
                  {new Date(selectedAppointment.date).toLocaleString("es-ES")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Mascota:</span>
                <span className="text-sm text-gray-800 dark:text-white/90">
                  {selectedAppointment.pet?.name}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Cliente:</span>
                <span className="text-sm text-gray-800 dark:text-white/90">
                  {selectedAppointment.pet?.owner?.firstName} {selectedAppointment.pet?.owner?.lastName}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Veterinario:</span>
                <span className="text-sm text-gray-800 dark:text-white/90">
                  {selectedAppointment.vet
                    ? `Dr. ${selectedAppointment.vet.firstName} ${selectedAppointment.vet.lastName}`
                    : "Sin asignar"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Motivo:</span>
                <span className="text-sm text-gray-800 dark:text-white/90">
                  {selectedAppointment.reason}
                </span>
              </div>
              {selectedAppointment.notes && (
                <div>
                  <span className="text-sm text-gray-500">Notas:</span>
                  <p className="mt-1 text-sm text-gray-800 dark:text-white/90">
                    {selectedAppointment.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
              <h4 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-400">
                Acciones
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedAppointment.status === "PENDING" && (
                  <>
                    <button
                      onClick={() => handleStatusChange(selectedAppointment.id, "CONFIRMED")}
                      className="px-3 py-1.5 text-sm font-medium text-white bg-green-500 rounded hover:bg-green-600"
                    >
                      Confirmar
                    </button>
                    <button
                      onClick={() => handleStatusChange(selectedAppointment.id, "CANCELLED")}
                      className="px-3 py-1.5 text-sm font-medium text-white bg-red-500 rounded hover:bg-red-600"
                    >
                      Cancelar
                    </button>
                  </>
                )}
                {selectedAppointment.status === "CONFIRMED" && (
                  <>
                    <button
                      onClick={() => handleStatusChange(selectedAppointment.id, "COMPLETED")}
                      className="px-3 py-1.5 text-sm font-medium text-white bg-gray-500 rounded hover:bg-gray-600"
                    >
                      Marcar Completada
                    </button>
                    <button
                      onClick={() => handleStatusChange(selectedAppointment.id, "NO_SHOW")}
                      className="px-3 py-1.5 text-sm font-medium text-white bg-purple-500 rounded hover:bg-purple-600"
                    >
                      No Asistió
                    </button>
                    <button
                      onClick={() => handleStatusChange(selectedAppointment.id, "CANCELLED")}
                      className="px-3 py-1.5 text-sm font-medium text-white bg-red-500 rounded hover:bg-red-600"
                    >
                      Cancelar
                    </button>
                  </>
                )}
                <button
                  onClick={() => handleDelete(selectedAppointment.id)}
                  className="px-3 py-1.5 text-sm font-medium text-red-600 border border-red-600 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  Eliminar
                </button>
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedAppointment(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 dark:text-gray-400 dark:border-strokedark dark:hover:bg-white/5"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}