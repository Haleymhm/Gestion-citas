import UserAddressCard from "@/components/user-profile/UserAddressCard";
import UserInfoCard from "@/components/user-profile/UserInfoCard";
import UserMetaCard from "@/components/user-profile/UserMetaCard";
import { Metadata } from "next";
import React from "react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Mi Perfil | VeteriApp",
  description: "Edita tu información personal, dirección y contraseña",
};

export default function PortalProfilePage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          <Link href="/portal/mis-citas" className="hover:text-brand-500">
            Portal
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-800 dark:text-white/90">Mi Perfil</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
          Mi Perfil
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Actualiza tu información personal, dirección de contacto y contraseña.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6 space-y-6">
        <UserMetaCard />
        <UserInfoCard />
        <UserAddressCard />
      </div>
    </div>
  );
}
