"use server"

import { prisma } from "@/lib/db"
import { enviarMensagemWhatsApp } from "@/lib/whatsapp"
import { revalidatePath } from "next/cache"

export async function adicionarMaterial(formData: FormData) {
  const nome = formData.get("nome") as string
  const categoria = formData.get("categoria") as string
  const unidade = formData.get("unidade") as string
  const quantidade = parseFloat(formData.get("quantidade") as string)
  const minimo = parseFloat(formData.get("minimo") as string)

  await prisma.material.create({
    data: { nome, categoria, unidade, quantidade, minimo }
  })

  revalidatePath("/estoque")
}

export async function atualizarQuantidade(formData: FormData) {
  const id = parseInt(formData.get("id") as string)
  const quantidade = parseFloat(formData.get("quantidade") as string)

  await prisma.material.update({
    where: { id },
    data: { quantidade }
  })

  revalidatePath("/estoque")
}

export async function removerMaterial(formData: FormData) {
  const id = parseInt(formData.get("id") as string)

  await prisma.material.delete({ where: { id } })

  revalidatePath("/estoque")
}

export async function atualizarMaterial(formData: FormData) {
  const id = parseInt(formData.get("id") as string)
  const nome = formData.get("nome") as string
  const categoria = formData.get("categoria") as string
  const unidade = formData.get("unidade") as string
  const quantidade = parseFloat(formData.get("quantidade") as string)
  const minimo = parseFloat(formData.get("minimo") as string)

  await prisma.material.update({
    where: { id },
    data: { nome, categoria, unidade, quantidade, minimo }
  })

  if (quantidade === 0) {
    await enviarMensagemWhatsApp(
      `🚨 *MadeiriteApp — Estoque Crítico*\n\n` +
      `O material *${nome}* está zerado!\n` +
      `Categoria: ${categoria}\n` +
      `Providencie a reposição urgente.`
    )
  } else if (quantidade <= minimo) {
    await enviarMensagemWhatsApp(
      `⚠️ *MadeiriteApp — Estoque Baixo*\n\n` +
      `O material *${nome}* está abaixo do mínimo.\n` +
      `Quantidade atual: ${quantidade} ${unidade}\n` +
      `Mínimo configurado: ${minimo} ${unidade}`
    )
  }

  revalidatePath("/estoque")
}