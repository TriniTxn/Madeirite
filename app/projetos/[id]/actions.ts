"use server"

import { prisma } from "@/lib/db";
import { TicketPlusIcon } from "lucide-react";
import { revalidatePath } from "next/cache";
import { title } from "process";

export async function toggleItemStatus(formData: FormData) {
  const itemId = parseInt(formData.get("itemId") as string);
  const projetoId = parseInt(formData.get("projetoId") as string);

  const item = await prisma.checklistItem.findUnique({ where: { id: itemId } });
  
  if (!item) return;

  await prisma.checklistItem.update({
    where: { id: itemId },
    data: { feito: !item.feito }
  });

  revalidatePath(`/projetos/${projetoId}`);
  revalidatePath("/projetos"); // Atualiza a barra de progresso na lista também
}

export async function updateAnotacoes(formData: FormData) {
  const projetoId = parseInt(formData.get("projetoId") as string);
  const anotacoes = formData.get("anotacoes") as string;

  await prisma.projeto.update({
    where: { id: projetoId },
    data: { anotacoes }
  });

  revalidatePath(`/projetos/${projetoId}`);
}

export async function adicionarItem(formData: FormData) {
    const projetoId = parseInt(formData.get("projetoId") as string);
    const titulo = formData.get("titulo") as string;

    if (!titulo?.trim()) return;

    const ultimoItem = await prisma.checklistItem.findFirst({
        where: { projetoId },
        orderBy: { ordem: "desc" }
    });
    
    await prisma.checklistItem.create({
        data: {
            titulo: titulo.trim(),
            projetoId,
            ordem: (ultimoItem?.ordem || 0) + 1,
        }
    });
    
    revalidatePath(`/projetos/${projetoId}`);
}