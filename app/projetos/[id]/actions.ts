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

export async function editarProjeto(formData: FormData) {
    const projetoId = parseInt(formData.get("projetoId") as string);
    const nome = formData.get("nome") as string;
    const status = formData.get("status") as string;
    const dataEntrega = formData.get("dataEntrega") as string;
    const clienteNome = formData.get("clienteNome") as string;
    const clienteTelefone = formData.get("clienteTelefone") as string;

    const projeto = await prisma.projeto.findUnique({ 
      where: { id: projetoId },
      include: { cliente: true }
    });

    if (!projeto) return;

    await prisma.projeto.update({
        where: { id: projetoId },
        data: {
          nome,
          status,
          dataEntrega: new Date(dataEntrega),
          cliente: {
            update: {
              where: { id: projeto.clienteId },
              data: {
                nome: clienteNome,
                telefone: clienteTelefone
              }
            }
          }
        }
    });

    revalidatePath(`/projetos/${projetoId}`);
    revalidatePath("/projetos");
}

export async function arquivarProjeto(formData: FormData) {
  const projetoId = parseInt(formData.get("projetoId") as string);

  await prisma.projeto.update({
    where: { id: projetoId },
    data: { status: "Arquivado" }
  });

  revalidatePath("/projetos");
}

export async function reordenarItens(formData: FormData) {
  const projetoId = parseInt(formData.get("projetoId") as string);
  const ordem: number[] = JSON.parse(formData.get("ordem") as string);

  await Promise.all(
    ordem.map((id, index) =>
      prisma.checklistItem.update({
        where: { id },
        data: { ordem: index },
      })
    )
  );

  revalidatePath(`/projetos/${projetoId}`);
}

export async function removerItem(formData: FormData) {
  const itemId = parseInt(formData.get("itemId") as string);
  const projetoId = parseInt(formData.get("projetoId") as string);

  await prisma.checklistItem.delete({
    where: { id: itemId }
  });

  revalidatePath(`/projetos/${projetoId}`);
}