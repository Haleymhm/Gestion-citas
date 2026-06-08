import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Agendar Cita | VetAppoint",
  description: "Solicitar nueva cita",
};

export default function AgendarCitaPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Agendar Cita" />
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxgray">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-black dark:text-white mb-4">
            Agendar Nueva Cita
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Solicita una nueva cita para tu mascota. La cita quedará pendiente de confirmación.
          </p>
        </div>
      </div>
    </div>
  );
}