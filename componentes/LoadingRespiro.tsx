"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

const LOADING_MESSAGES = [
  "Calculando Performance que se mantém...",
  "Sustentando Tecnologia + Método...",
  "Preparando sua Experiência Premium...",
  "Conectando Embaixadores e Escola...",
  "Alinhando Comunidade e Carreira..."
];

export default function LoadingRespiro() {
  const [message, setMessage] = useState("Carregando MASC PRO...");

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * LOADING_MESSAGES.length);
    setMessage(LOADING_MESSAGES[randomIndex]);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-500">
      <Loader2 className="h-10 w-10 text-[#C9A66B] animate-spin mb-4" />
      <p className="text-slate-400 text-sm font-medium tracking-wide animate-pulse">
        {message}
      </p>
    </div>
  );
}