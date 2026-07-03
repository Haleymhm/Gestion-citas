"use client";
import React, { useState } from "react";

interface Branding {
  clinicName: string;
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  footerText: string;
  fromEmail: string;
  fromName: string;
}

export default function LogoUploader({
  branding,
  onUpload,
}: {
  branding: Branding | null;
  onUpload: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("logo", file);

      const res = await fetch("/api/v1/configuracion/branding/logo", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Error al subir logo");
        return;
      }
      onUpload(data.data.logoUrl);
    } catch {
      setError("Error de conexión");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">
        Logo de la clínica
      </label>
      <div className="flex items-center gap-4">
        <div className="w-32 h-16 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center overflow-hidden">
          {branding?.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={branding.logoUrl}
              alt="Logo"
              className="max-w-full max-h-full object-contain"
            />
          ) : (
            <span className="text-xs text-gray-400">Sin logo</span>
          )}
        </div>
        <div className="flex-1">
          <label
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <input
              type="file"
              accept="image/png,image/jpeg,image/svg+xml"
              onChange={handleFileChange}
              disabled={uploading}
              className="hidden"
            />
            {uploading ? "Subiendo..." : "Cambiar logo"}
          </label>
          <p className="text-xs text-gray-500 mt-2">
            PNG, JPG o SVG. Máximo 2MB.
          </p>
          {error && (
            <p className="text-xs text-red-500 mt-1">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}
