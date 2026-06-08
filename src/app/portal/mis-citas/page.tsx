import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mis Citas | VetAppoint",
  description: "Ver mis citas agendadas",
};

export default function MisCitasPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Mis Citas" />
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxgray">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-black dark:text-white mb-4">
            Mis Citas
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Consulta el estado de tus citas agendadas.
          </p>
        </div>
      </div>
    </div>
  );
}