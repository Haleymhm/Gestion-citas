import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mis Mascotas | VeteriApp Gestión Integral Veterinaria",
  description: "Gestión de mascotas del cliente",
};

export default function MisMascotasPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Mis Mascotas" />
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxgray">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-black dark:text-white mb-4">
            Mis Mascotas
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Gestiona las mascotas registradas en tu cuenta.
          </p>
        </div>
      </div>
    </div>
  );
}