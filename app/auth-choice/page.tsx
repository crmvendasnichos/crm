"use client";
import { useRouter } from "next/navigation";

export default function AuthChoice() {
  const router = useRouter();

  return (
    <main className="flex flex-col items-center justify-center h-screen gap-8 p-6 max-w-md mx-auto">
      <h1 className="text-xl font-semibold">Como você quer entrar?</h1>

      <button
        onClick={() => router.push("/login")}
        className="w-full rounded-xl bg-brand text-white py-4"
      >
        Já tenho cadastro
      </button>

      <button
        onClick={() => router.push("/signup")}
        className="w-full rounded-xl border-2 border-brand text-brand py-4"
      >
        Criar uma conta
      </button>
    </main>
  );
}
