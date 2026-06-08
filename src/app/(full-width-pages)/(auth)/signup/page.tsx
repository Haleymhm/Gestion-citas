import SignUpForm from "@/components/auth/SignUpForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Registrarse | VetAppoint",
  description: "Regístrate en el sistema de gestión de citas veterinarias",
};

export default function SignUp() {
  return <SignUpForm />;
}
