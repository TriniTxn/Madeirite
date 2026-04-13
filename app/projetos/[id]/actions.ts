"use server"

import { prisma } from "@/lib/db";
import { enviarMensagemWhatsApp } from "@/lib/whatsapp";
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

  // Alerta de entrega próxima (Logic Update)
const projeto = await prisma.projeto.findUnique({
  where: { id: projetoId },
  include: { cliente: true, itens: true }
});

if (projeto && !["Finalizado", "Cancelado"].includes(projeto.status)) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0); // Zera horas para comparação de dias inteiros

  const entrega = new Date(projeto.dataEntrega);
  entrega.setHours(0, 0, 0, 0);

  // Calcula a diferença em dias
  const diffTime = entrega.getTime() - hoje.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Configuração de alertas por prioridade
  let prefixo = "";
  let enviar = false;

  if (diffDays === 7) {
    prefixo = "📅 *ALERTA SEMANAL*";
    enviar = true;
  } else if (diffDays === 3) {
    prefixo = "⏳ *PRAZO CURTO (3 DIAS)*";
    enviar = true;
  } else if (diffDays === 1) {
    prefixo = "🚨 *ENTREGA AMANHÃ*";
    enviar = true;
  } else if (diffDays === 0) {
    prefixo = "🚩 *ENTREGA HOJE*";
    enviar = true;
  }

  if (enviar) {
    const feitos = projeto.itens.filter(i => i.feito).length;
    const total = projeto.itens.length;
    const progresso = total > 0 ? Math.round((feitos / total) * 100) : 0;

    const mensagem = 
      `${prefixo}\n\n` +
      `Projeto: *${projeto.nome}*\n` +
      `Cliente: *${projeto.cliente.nome}*\n` +
      `Progresso: ${progresso}% (${feitos}/${total} tarefas)\n` +
      `Data: ${entrega.toLocaleDateString("pt-BR")}\n\n` +
      `_Verifique os detalhes no painel da marcenaria._`;

    await enviarMensagemWhatsApp(mensagem);
  }
}

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
    orderBy: { ordem: "desc" },
  });

  const novoItem = await prisma.checklistItem.create({
    data: {
      titulo: titulo.trim(),
      projetoId,
      ordem: (ultimoItem?.ordem ?? 0) + 1,
    },
  });

  revalidatePath(`/projetos/${projetoId}`);
  return novoItem.id  // ← retorna o ID real
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

  console.log("Ordem recebida:", ordem);
  
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