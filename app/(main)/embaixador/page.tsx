"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect, useState } from "react";
import { Share2, Copy, Check, Users, Trophy, Calendar } from "lucide-react";

export default function EmbaixadorPage() {
  const [inviteLink, setInviteLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState({ total: 0, active: 0, earnings: 0 });
  const [invitees, setInvitees] = useState<any[]>([]); // Lista de pessoas indicadas
  const [loading, setLoading] = useState(true);
  
  const supabase = createClientComponentClient();

  // 1. Lógica para formatar o nome no link (ex: joao-silva)
  const formatRefCode = (userProfile: any, userId: string) => {
    if (userProfile?.username) return userProfile.username;
    if (userProfile?.full_name) {
      return userProfile.full_name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, '-');
    }
    return userId;
  };

  useEffect(() => {
    async function getData() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // A. Pega o perfil atual para gerar o link
        const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, username")
            .eq("id", session.user.id)
            .single();

        if (typeof window !== "undefined") {
            const code = formatRefCode(profile, session.user.id);
            setInviteLink(`${window.location.origin}/cadastro?ref=${code}`);
        }

        // B. Busca quem eu indiquei (Lista de Indicados)
        const { data: myInvitees, count } = await supabase
            .from("profiles")
            .select("id, full_name, created_at, instagram", { count: 'exact' })
            .eq("invited_by", session.user.id) // Filtra quem tem meu ID na coluna invited_by
            .order("created_at", { ascending: false });

        setInvitees(myInvitees || []);
        
        // C. Atualiza estatísticas reais
        setStats({
            total: count || 0,
            active: count || 0, // Por enquanto considera todos ativos
            earnings: (count || 0) * 100 // Exemplo: 100 PRO por indicado
        });
      }
      setLoading(false);
    }
    getData();
  }, [supabase]);

  // 2. Função de Copiar Blindada (Funciona em Celular)
  const handleCopy = async () => {
    if (!inviteLink) return;

    try {
        await navigator.clipboard.writeText(inviteLink);
        setCopied(true);
    } catch (err) {
        const textArea = document.createElement("textarea");
        textArea.value = inviteLink;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            setCopied(true);
        } catch (e) {
            console.error('Erro ao copiar', e);
        }
        document.body.removeChild(textArea);
    }
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div className="p-8 text-slate-500">Carregando sua rede...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-8">
        <div className="p-4 bg-[#C9A66B]/10 rounded-2xl border border-[#C9A66B]/20">
            <Share2 size={32} className="text-[#C9A66B]" />
        </div>
        <div>
            <h1 className="text-3xl font-black text-white tracking-tighter">Área de Rede</h1>
            <p className="text-slate-400">Construa sua comunidade e ganhe PROs.</p>
        </div>
      </div>

      {/* CARD DO LINK (COM BOTÃO OUTLINE) */}
      <div className="bg-[#0A0A0A] border border-white/10 p-8 rounded-2xl">
          <h2 className="text-xl font-bold text-white mb-4">Seu Link de Indicação</h2>
          <div className="flex flex-col md:flex-row gap-4">
              <input 
                readOnly 
                value={inviteLink}
                className="flex-1 bg-black border border-white/10 rounded-xl px-6 py-4 text-slate-300 font-mono text-sm focus:outline-none focus:border-[#C9A66B]"
              />
              
              <button 
                onClick={handleCopy}
                className="bg-transparent border border-[#C9A66B] text-[#C9A66B] hover:bg-[#C9A66B] hover:text-black font-bold px-8 py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 whitespace-nowrap"
              >
                {copied ? <Check size={20} /> : <Copy size={20} />}
                {copied ? "Link Copiado" : "Copiar Link"}
              </button>
          </div>
      </div>

      {/* ESTATÍSTICAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#0A0A0A] border border-white/10 p-6 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                  <Users size={18} className="text-slate-500" />
                  <span className="text-xs font-bold text-slate-500 uppercase">Total Indicados</span>
              </div>
              <p className="text-3xl font-black text-white">{stats.total}</p>
          </div>

          <div className="bg-[#0A0A0A] border border-white/10 p-6 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                  <Check size={18} className="text-green-500" />
                  <span className="text-xs font-bold text-slate-500 uppercase">Ativos</span>
              </div>
              <p className="text-3xl font-black text-white">{stats.active}</p>
          </div>

          <div className="bg-[#0A0A0A] border border-white/10 p-6 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                  <Trophy size={18} className="text-[#C9A66B]" />
                  <span className="text-xs font-bold text-slate-500 uppercase">Ganhos (PRO)</span>
              </div>
              <p className="text-3xl font-black text-[#C9A66B]">{stats.earnings}</p>
          </div>
      </div>

      {/* LISTA DE QUEM VOCÊ INDICOU */}
      <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-white/10">
              <h3 className="text-lg font-bold text-white">Últimos Membros Indicados</h3>
          </div>
          
          <div className="divide-y divide-white/5">
              {invitees.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-sm">
                      Você ainda não indicou ninguém. Copie seu link acima!
                  </div>
              ) : (
                  invitees.map((person) => (
                      <div key={person.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                          <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-slate-300 uppercase">
                                  {person.full_name?.substring(0, 2) || "??"}
                              </div>
                              <div>
                                  <p className="text-white font-bold text-sm">{person.full_name}</p>
                                  <p className="text-slate-500 text-xs">
                                      {person.instagram || "Sem instagram"}
                                  </p>
                              </div>
                          </div>
                          
                          <div className="flex items-center gap-2 text-slate-500 text-xs">
                              <Calendar size={14} />
                              <span>
                                  {new Date(person.created_at).toLocaleDateString('pt-BR')}
                              </span>
                          </div>
                      </div>
                  ))
              )}
          </div>
      </div>

    </div>
  );
}