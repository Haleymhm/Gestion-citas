import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Recuperar contraseña | VeteriApp",
  description: "Restablece la contraseña de tu cuenta en VeteriApp",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
