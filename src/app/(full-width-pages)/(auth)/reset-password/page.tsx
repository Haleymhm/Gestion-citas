import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Restablecer contraseña | VeteriApp",
  description: "Crea una nueva contraseña para tu cuenta de VeteriApp",
};

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
