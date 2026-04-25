"use server"

import { prisma } from "@/lib/db"
import { enviarMensagemWhatsApp } from "@/lib/whatsapp"
import { revalidatePath } from "next/cache"

export async function criarProjeto(formData: {
  nome: string
  clienteNome: string
  clienteTelefone: string
  dataEntrega: string
  status: string
}) {
  await prisma.projeto.create({
    data: {
      nome: formData.nome,
      dataEntrega: new Date(formData.dataEntrega),
      status: formData.status,
      cliente: {
        create: {
          nome: formData.clienteNome,
          telefone: formData.clienteTelefone,
        },
      },
    },
  })

  // Alerta se a data de entrega já nascer dentro de 7 dias
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const entrega = new Date(formData.dataEntrega)
  entrega.setHours(0, 0, 0, 0)
  const diff = Math.ceil((entrega.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))

  if (diff >= 0 && diff <= 7 && formData.status !== "Finalizado") {
    const prefixo = diff === 0 ? "🚩 *ENTREGA HOJE*" :
                    diff === 1 ? "🚨 *ENTREGA AMANHÃ*" :
                    `📅 *PRAZO EM ${diff} DIAS*`

    await enviarMensagemWhatsApp(
      `🪵 *Novo projeto criado com prazo curto!*\n\n` +
      `${prefixo}\n\n` +
      `Projeto: *${formData.nome}*\n` +
      `Cliente: *${formData.clienteNome}*\n` +
      `Entrega: ${entrega.toLocaleDateString("pt-BR")}\n\n` +
      `_Acesse o painel para mais detalhes._`
    )
  }

  revalidatePath("/projetos")
}