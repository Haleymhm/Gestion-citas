"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

interface Pet {
  id: number;
  name: string;
  species: string;
  breed: string | null;
  birthDate: string | null;
  weight: number | null;
  sex: string | null;
  reproductiveStatus: string | null;
  specialCharacteristics: string | null;
  microchipNumber: string | null;
  createdAt: string;
  owner: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export default function MisMascotasPage() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPets();
  }, []);

  const fetchPets = async () => {
    try {
      const res = await fetch("/api/v1/pets");
      const data = await res.json();
      if (data.success) {
        const fetchedPets = data.data.data || [];
        setPets(fetchedPets);
        if (fetchedPets.length > 0) {
          setSelectedPet(fetchedPets[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching pets:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (birthDate: string | null) => {
    if (!birthDate) return null;
    const birth = new Date(birthDate);
    const today = new Date();
    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();
    if (months < 0 || (months === 0 && today.getDate() < birth.getDate())) {
      years--;
      months += 12;
    }
    if (years < 0) return null;
    if (years === 0 && months === 0) return "Recién nacido";
    if (years === 0) return `${months} meses`;
    if (months === 0) return `${years} años`;
    return `${years} años ${months} meses`;
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "No registrado";
    return new Date(dateStr).toLocaleDateString("es-CL");
  };

  const getSexLabel = (sex: string | null) => {
    if (!sex) return "No especificado";
    const labels: Record<string, string> = {
      MALE: "Macho",
      FEMALE: "Hembra",
    };
    return labels[sex] || sex;
  };

  const getReproductiveLabel = (status: string | null) => {
    if (!status) return "No especificado";
    const labels: Record<string, string> = {
      FERTILE: "Fértil",
      STERILIZED: "Esterilizado/a",
      CASTRATED: "Castrado/a",
    };
    return labels[status] || status;
  };

  const getSpeciesIcon = (species: string) => {
    const s = species.toLowerCase();
    if (s.includes("perro")) return "🐕";
    if (s.includes("gato")) return "🐈";
    if (s.includes("ave")) return "🐦";
    if (s.includes("conejo")) return "🐰";
    if (s.includes("pece") || s.includes("pez")) return "🐠";
    if (s.includes("hamster")) return "🐹";
    if (s.includes("tortuga")) return "🐢";
    if (s.includes("reptil")) return "🦎";
    return "🐾";
  };

  const getSpeciesColor = (species: string) => {
    const s = species.toLowerCase();
    if (s.includes("perro")) return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    if (s.includes("gato")) return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
    if (s.includes("ave")) return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
    if (s.includes("conejo")) return "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400";
    if (s.includes("pece") || s.includes("pez")) return "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400";
    return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageBreadcrumb pageTitle="Mis Mascotas" />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-gray-500">Cargando...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Mis Mascotas" />

      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
          Mis Mascotas
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Visualiza y gestiona las mascotas registradas en tu cuenta.
        </p>
      </div>

      {pets.length === 0 ? (
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxgray p-12 text-center">
          <div className="text-6xl mb-4">🐾</div>
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">
            No tienes mascotas registradas
          </p>
          <p className="text-sm text-gray-400">
            Contacta a la clínica para agregar una mascota a tu cuenta.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de mascotas */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Tus mascotas ({pets.length})
            </h2>
            <div className="space-y-3">
              {pets.map((pet) => (
                <button
                  key={pet.id}
                  onClick={() => setSelectedPet(pet)}
                  className={`w-full text-left p-4 rounded-lg border transition-all duration-200 ${
                    selectedPet?.id === pet.id
                      ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20 shadow-md"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-boxgray"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{getSpeciesIcon(pet.species)}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 dark:text-white/90 truncate">
                        {pet.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getSpeciesColor(pet.species)}`}>
                          {pet.species}
                        </span>
                        {pet.breed && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {pet.breed}
                          </span>
                        )}
                      </div>
                      {calculateAge(pet.birthDate) && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          {calculateAge(pet.birthDate)}
                        </p>
                      )}
                    </div>
                    {selectedPet?.id === pet.id && (
                      <div className="w-2 h-2 rounded-full bg-brand-500 flex-shrink-0" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Detalle de mascota seleccionada */}
          {selectedPet && (
            <div className="lg:col-span-2 space-y-6">
              {/* Tarjeta principal */}
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-boxgray overflow-hidden">
                <div className="p-6">
                  {/* Header con icono y nombre */}
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-3xl flex-shrink-0">
                      {getSpeciesIcon(selectedPet.species)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">
                        {selectedPet.name}
                      </h2>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2.5 py-0.5 rounded-full ${getSpeciesColor(selectedPet.species)}`}>
                          {selectedPet.species}
                        </span>
                        {selectedPet.breed && (
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {selectedPet.breed}
                          </span>
                        )}
                      </div>
                      {calculateAge(selectedPet.birthDate) && (
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                          {calculateAge(selectedPet.birthDate)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Datos básicos en grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    <div className="p-3 rounded-lg bg-gray-50 dark:bg-white/5">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Sexo</p>
                      <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                        {getSexLabel(selectedPet.sex)}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-gray-50 dark:bg-white/5">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Estado</p>
                      <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                        {getReproductiveLabel(selectedPet.reproductiveStatus)}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-gray-50 dark:bg-white/5">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Peso</p>
                      <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                        {selectedPet.weight ? `${selectedPet.weight} kg` : "No registrado"}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-gray-50 dark:bg-white/5">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Nacimiento</p>
                      <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                        {formatDate(selectedPet.birthDate)}
                      </p>
                    </div>
                  </div>

                  {/* Microchip y características */}
                  {(selectedPet.microchipNumber || selectedPet.specialCharacteristics) && (
                    <div className="space-y-2 mb-6 p-4 rounded-lg bg-gray-50 dark:bg-white/5">
                      {selectedPet.microchipNumber && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Microchip:</span>
                          <span className="text-sm text-gray-800 dark:text-white/90 font-mono bg-white dark:bg-gray-800 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-700">
                            {selectedPet.microchipNumber}
                          </span>
                        </div>
                      )}
                      {selectedPet.specialCharacteristics && (
                        <div className="flex items-start gap-2">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400 flex-shrink-0">Características:</span>
                          <span className="text-sm text-gray-800 dark:text-white/90">
                            {selectedPet.specialCharacteristics}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Dueño (solo info contextual) */}
                  <div className="flex items-center gap-2 mb-6 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800">
                    <div className="w-8 h-8 rounded-full bg-blue-200 dark:bg-blue-800 flex items-center justify-center text-blue-700 dark:text-blue-300 text-sm font-bold">
                      {selectedPet.owner.firstName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                        Propietario
                      </p>
                      <p className="text-sm text-blue-600 dark:text-blue-400">
                        {selectedPet.owner.firstName} {selectedPet.owner.lastName}
                      </p>
                    </div>
                  </div>

                  {/* Acciones rápidas */}
                  <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <Link
                      href={`/portal/historial-medico?petId=${selectedPet.id}`}
                      className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition-colors"
                    >
                      📋 Ver Historial Médico
                    </Link>
                    <Link
                      href={`/portal/agendar-citas?petId=${selectedPet.id}`}
                      className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-brand-600 bg-brand-50 border border-brand-200 rounded-lg hover:bg-brand-100 dark:text-brand-300 dark:bg-brand-900/20 dark:hover:bg-brand-900/30 transition-colors"
                    >
                      📅 Agendar Cita
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
