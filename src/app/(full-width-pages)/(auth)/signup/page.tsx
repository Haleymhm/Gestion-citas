import SignUpForm from "@/components/auth/SignUpForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Registrarse | VeteriApp Gestión Integral Veterinaria",
  description: "Regístrate en el sistema de gestión de citas veterinarias",
};

export default function SignUp() {
  return <SignUpForm />;
}
