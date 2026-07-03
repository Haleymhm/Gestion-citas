import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ConfigTabs from "@/components/configuracion/ConfigTabs";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Configuración | VeteriApp",
  description: "Configura horarios, feriados y marca de la clínica",
};

export default async function ConfiguracionPage() {
  const session = await getSession();

  if (!session) {
    redirect("/signin");
  }

  if (session.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Configuración" />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
          Configuración del Sistema
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Personaliza los horarios, feriados y marca de la clínica.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <ConfigTabs />
      </div>
    </div>
  );
}
