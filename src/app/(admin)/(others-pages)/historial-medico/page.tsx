import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Historial Médico | VetAppoint",
  description: "Historial médico de mascotas",
};

export default function HistorialMedicoPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Historial Médico" />
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxgray">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-black dark:text-white mb-4">
            Historial Médico
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Modulo para gestionar el historial médico de las mascotas.
            Solo visible para Veterinarios y Administradores.
          </p>
        </div>
      </div>
    </div>
  );
}