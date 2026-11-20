"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { isGoogleAuthConfigured } from "@/lib/auth-config";

export default function LoginButton() {
  const router = useRouter();

  const handleLogin = () => {
    if (isGoogleAuthConfigured) {
      signIn("google", { callbackUrl: "/dashboard" });
      return;
    }

    router.push("/dashboard");
  };

  return (
    <button
      onClick={handleLogin}
      className="bg-white text-gray-800 font-bold py-2 px-4 rounded border border-gray-300 shadow hover:bg-gray-100 flex items-center gap-2 transition-all"
    >
      <img 
        src="https://www.svgrepo.com/show/475656/google-color.svg" 
        alt="Google Logo" 
        className="w-5 h-5" 
      />
      {isGoogleAuthConfigured ? "Continuar con Google" : "Entrar al sistema"}
    </button>
  );
}