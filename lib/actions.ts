"use server"

import { prisma } from "@/lib/db"
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

  revalidatePath("/projetos")
}