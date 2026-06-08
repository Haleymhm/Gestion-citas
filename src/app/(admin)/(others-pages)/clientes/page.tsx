import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Clientes | VetAppoint",
  description: "Gestión de clientes del sistema",
};

export default function ClientesPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Clientes" />
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxgray">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-black dark:text-white mb-4">
            Gestión de Clientes
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Modulo para administrar clientes de la veterinaria.
          </p>
        </div>
      </div>
    </div>
  );
}