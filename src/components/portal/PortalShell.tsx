"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

interface UserData {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface PortalShellProps {
  user: UserData;
  children: React.ReactNode;
}

export function PortalShell({ user, children }: PortalShellProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/v1/auth/logout", { method: "POST" });
    router.push("/signin");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white border-b border-gray-200 dark:border-gray-800 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/portal/mis-citas" className="flex items-center">
                <span className="text-xl font-bold text-brand-500">VeteriApp Gestión Integral Veterinaria</span>
              </Link>
              <nav className="hidden md:flex gap-6">
                  <Link
                  href="/portal/mis-mascotas"
                  className="text-sm font-medium text-gray-700 hover:text-brand-500 dark:text-gray-300"
                >
                  Mis Mascotas
                </Link>
                <Link
                  href="/portal/mis-citas"
                  className="text-sm font-medium text-gray-700 hover:text-brand-500 dark:text-gray-300"
                >
                  Mis Citas
                </Link>
                <Link
                  href="/portal/agendar-citas"
                  className="text-sm font-medium text-gray-700 hover:text-brand-500 dark:text-gray-300"
                >
                  Agendar Cita
                </Link>
                <Link
                  href="/portal/historial-medico"
                  className="text-sm font-medium text-gray-700 hover:text-brand-500 dark:text-gray-300"
                >
                  Historial Médico
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {user.firstName} {user.lastName}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-500 hover:text-red-500"
                >
                  Cerrar sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}