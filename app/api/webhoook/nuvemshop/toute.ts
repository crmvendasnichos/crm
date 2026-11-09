import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Configuração do Banco (Use suas variáveis de ambiente)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Role key é necessária para editar XP
)

export async function POST(req: Request) {
  try {
    const body = await req.json()

    // 1. Verificamos se o evento é "Pedido Pago" na Nuvemshop
    // Nota: A estrutura exata depende da versão da API, mas geralmente é 'order.paid'
    if (body.event === 'order.paid' || body.status === 'paid') {
      const emailCliente = body.customer.email
      const valorTotal = parseFloat(body.total)

      // 2. Calculamos o XP (ex: 1 XP para cada 2 reais)
      const xpGanho = Math.floor(valorTotal / 2)

      // 3. Buscamos o usuário no Supabase pelo e-mail
      const { data: usuario, error: userError } = await supabase
        .from('profiles') // Nome da sua tabela de usuários/perfis
        .select('id, xp')
        .eq('email', emailCliente)
        .single()

      if (usuario) {
        // 4. Atualizamos o XP do usuário para a gamificação subir
        const novoXP = (usuario.xp || 0) + xpGanho
        
        await supabase
          .from('profiles')
          .update({ xp: novoXP })
          .eq('id', usuario.id)

        console.log(`Sucesso: ${xpGanho} XP adicionados ao usuário ${emailCliente}`)
      }
    }

    return NextResponse.json({ message: "Webhook recebido com sucesso" }, { status: 200 })
  } catch (error) {
    console.error("Erro no Webhook:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}