"use client";

import { useEffect, useState } from "react";

interface Owner {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

interface Pet {
  id: number;
  name: string;
  species: string;
  breed: string | null;
  birthDate: string | null;
  weight: number | null;
  owner: Owner;
  createdAt: string;
}

interface ApiResponse {
  data: Pet[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface Client {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

interface ClientsApiResponse {
  data: Client[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function MascotasPage() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    name: "",
    species: "",
    breed: "",
    birthDate: "",
    weight: "",
    ownerId: "",
  });

  useEffect(() => {
    fetchPets();
    fetchClientsForSelect();
  }, [search]);

  const fetchPets = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);

      const res = await fetch(`/api/v1/pets?${params}`);
      const data = await res.json();
      if (data.success) {
        const response = data.data as ApiResponse;
        setPets(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching pets:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClientsForSelect = async () => {
    try {
      const res = await fetch("/api/v1/clients");
      const data = await res.json();
      if (data.success) {
        const response = data.data as ClientsApiResponse;
        setClients(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      name: form.name,
      species: form.species,
      breed: form.breed || null,
      birthDate: form.birthDate || null,
      weight: form.weight ? parseFloat(form.weight) : null,
      ownerId: form.ownerId,
    };

    const url = editingPet ? `/api/v1/pets/${editingPet.id}` : "/api/v1/pets";
    const method = editingPet ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        fetchPets();
        resetForm();
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error("Error saving pet:", error);
    }
  };

  const handleEdit = (pet: Pet) => {
    setEditingPet(pet);
    setForm({
      name: pet.name,
      species: pet.species,
      breed: pet.breed || "",
      birthDate: pet.birthDate ? pet.birthDate.split("T")[0] : "",
      weight: pet.weight ? pet.weight.toString() : "",
      ownerId: pet.owner.id.toString(),
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Está seguro de eliminar esta mascota?")) return;

    try {
      const res = await fetch(`/api/v1/pets/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        fetchPets();
      }
    } catch (error) {
      console.error("Error deleting pet:", error);
    }
  };

  const resetForm = () => {
    setShowModal(false);
    setEditingPet(null);
    setForm({
      name: "",
      species: "",
      breed: "",
      birthDate: "",
      weight: "",
      ownerId: "",
    });
  };

  const getSpeciesIcon = (species: string) => {
    const s = species.toLowerCase();
    if (s.includes("perro")) return "🐕";
    if (s.includes("gato")) return "🐈";
    if (s.includes("ave") || s.includes("pájaro")) return "🐦";
    if (s.includes("pez")) return "🐟";
    if (s.includes("hamster") || s.includes("roedor")) return "🐹";
    return "🐾";
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
          Gestión de Mascotas
        </h2>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600"
        >
          + Nueva Mascota
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 text-sm border rounded-lg bg-white dark:bg-boxdark border-gray-300 dark:border-strokedark w-full max-w-xs"
        />
      </div>

      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxgray">
        {loading ? (
          <div className="p-6 text-center text-gray-500">Cargando...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-stroke dark:border-strokedark">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                    Mascota
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                    Especie / Raza
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                    Propietario
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                    Peso
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {pets.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                      No hay mascotas registradas
                    </td>
                  </tr>
                ) : (
                  pets.map((pet) => (
                    <tr
                      key={pet.id}
                      className="border-b border-stroke dark:border-strokedark hover:bg-gray-50 dark:hover:bg-white/5"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{getSpeciesIcon(pet.species)}</span>
                          <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                            {pet.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                        <div>{pet.species}</div>
                        {pet.breed && (
                          <div className="text-xs text-gray-400">{pet.breed}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                        {pet.owner.firstName} {pet.owner.lastName}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                        {pet.weight ? `${pet.weight} kg` : "-"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleEdit(pet)}
                          className="mr-2 text-sm text-blue-500 hover:text-blue-600"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(pet.id)}
                          className="text-sm text-red-500 hover:text-red-600"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md p-6 bg-white rounded-lg dark:bg-boxdark">
            <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
              {editingPet ? "Editar Mascota" : "Nueva Mascota"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-400">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-boxdark border-gray-300 dark:border-strokedark"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-400">
                    Especie *
                  </label>
                  <select
                    value={form.species}
                    onChange={(e) => setForm({ ...form, species: e.target.value })}
                    required
                    className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-boxdark border-gray-300 dark:border-strokedark"
                  >
                    <option value="">Seleccionar</option>
                    <option value="Perro">Perro</option>
                    <option value="Gato">Gato</option>
                    <option value="Ave">Ave</option>
                    <option value="Hamster">Hamster</option>
                    <option value="Conejo">Conejo</option>
                    <option value="Pez">Pez</option>
                    <option value="Reptil">Reptil</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-400">
                    Raza
                  </label>
                  <input
                    type="text"
                    value={form.breed}
                    onChange={(e) => setForm({ ...form, breed: e.target.value })}
                    className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-boxdark border-gray-300 dark:border-strokedark"
                  />
                </div>
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-400">
                  Propietario *
                </label>
                <select
                  value={form.ownerId}
                  onChange={(e) => setForm({ ...form, ownerId: e.target.value })}
                  required
                  className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-boxdark border-gray-300 dark:border-strokedark"
                >
                  <option value="">Seleccionar cliente</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.firstName} {client.lastName} ({client.email})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-400">
                    Fecha de Nacimiento
                  </label>
                  <input
                    type="date"
                    value={form.birthDate}
                    onChange={(e) =>
                      setForm({ ...form, birthDate: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-boxdark border-gray-300 dark:border-strokedark"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-400">
                    Peso (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={form.weight}
                    onChange={(e) => setForm({ ...form, weight: e.target.value })}
                    className="w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-boxdark border-gray-300 dark:border-strokedark"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 dark:text-gray-400 dark:border-strokedark dark:hover:bg-white/5"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600"
                >
                  {editingPet ? "Actualizar" : "Crear"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}