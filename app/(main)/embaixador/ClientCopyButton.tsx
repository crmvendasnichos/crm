"use client";

import { Copy, Check } from "lucide-react";
import { useState } from "react";

export default function ClientCopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button 
        onClick={handleCopy}
        className="bg-transparent border border-[#C9A66B] text-[#C9A66B] hover:bg-[#C9A66B] hover:text-black font-bold px-6 py-3 rounded-lg flex items-center gap-2 transition-all active:scale-95 whitespace-nowrap"
    >
        {copied ? <Check size={18} /> : <Copy size={18} />}
        {copied ? "Copiado!" : "Copiar"}
    </button>
  );
}