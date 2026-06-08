"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface UserData {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/v1/auth/session");
        const data = await res.json();
        if (!data.success) {
          router.push("/signin");
          return;
        }
        if (data.data.role !== "CLIENT") {
          router.push("/");
          return;
        }
        setUser(data.data);
      } catch {
        router.push("/signin");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/v1/auth/logout", { method: "POST" });
    router.push("/signin");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-gray-600 dark:text-gray-400">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white border-b border-gray-200 dark:border-gray-800 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/portal/mis-citas" className="flex items-center">
                <span className="text-xl font-bold text-brand-500">VetAppoint</span>
              </Link>
              <nav className="hidden md:flex gap-6">
                <Link
                  href="/portal/mis-citas"
                  className="text-sm font-medium text-gray-700 hover:text-brand-500 dark:text-gray-300"
                >
                  Mis Citas
                </Link>
                <Link
                  href="/portal/mis-mascotas"
                  className="text-sm font-medium text-gray-700 hover:text-brand-500 dark:text-gray-300"
                >
                  Mis Mascotas
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
                  {user?.firstName} {user?.lastName}
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