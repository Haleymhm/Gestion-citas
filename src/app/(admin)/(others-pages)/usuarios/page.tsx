import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Usuarios | VetAppoint",
  description: "Gestión de usuarios del sistema",
};

export default function UsuariosPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Usuarios" />
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxgray">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-black dark:text-white mb-4">
            Gestión de Usuarios
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Modulo para administrar usuarios del sistema (Recepcionistas, Veterinarios).
            Solo accesible por el Administrador.
          </p>
        </div>
      </div>
    </div>
  );
}