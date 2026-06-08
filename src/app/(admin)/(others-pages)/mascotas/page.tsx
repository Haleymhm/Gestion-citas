import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mascotas | VetAppoint",
  description: "Gestión de mascotas del sistema",
};

export default function MascotasPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Mascotas" />
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxgray">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-black dark:text-white mb-4">
            Gestión de Mascotas
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Modulo para administrar las mascotas registradas.
          </p>
        </div>
      </div>
    </div>
  );
}