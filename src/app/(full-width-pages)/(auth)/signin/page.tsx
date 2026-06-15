import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Iniciar Sesión | VeteriApp Gestión Integral Veterinaria",
  description: "Inicia sesión en el sistema de gestión de citas veterinarias",
};

export default function SignIn() {
  return <SignInForm />;
}
