"use server"

import { prisma } from "@/lib/db";
import { enviarMensagemWhatsApp } from "@/lib/whatsapp";
import { revalidatePath } from "next/cache";

export async function toggleItemStatus(formData: FormData) {
  const itemId = parseInt(formData.get("itemId") as string);
  const projetoId = parseInt(formData.get("projetoId") as string);

  const item = await prisma.checklistItem.findUnique({ where: { id: itemId } });
  if (!item) return;

  await prisma.checklistItem.update({
    where: { id: itemId },
    data: { feito: !item.feito }
  });

  const projeto = await prisma.projeto.findUnique({
    where: { id: projetoId },
    include: { cliente: true, itens: true }
  });

  if (projeto && !["Finalizado", "Cancelado", "Arquivado"].includes(projeto.status)) {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const entrega = new Date(projeto.dataEntrega);
    entrega.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((entrega.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));

    let prefixo = "";
    let enviar = false;

    if (diffDays === 7)      { prefixo = "📅 *ALERTA SEMANAL*";      enviar = true; }
    else if (diffDays === 3) { prefixo = "⏳ *PRAZO CURTO (3 DIAS)*"; enviar = true; }
    else if (diffDays === 1) { prefixo = "🚨 *ENTREGA AMANHÃ*";       enviar = true; }
    else if (diffDays === 0) { prefixo = "🚩 *ENTREGA HOJE*";         enviar = true; }

    if (enviar) {
      const feitos = projeto.itens.filter(i => i.feito).length;
      const total = projeto.itens.length;
      const progresso = total > 0 ? Math.round((feitos / total) * 100) : 0;

      await enviarMensagemWhatsApp(
        `${prefixo}\n\n` +
        `Projeto: *${projeto.nome}*\n` +
        `Cliente: *${projeto.cliente.nome}*\n` +
        `Progresso: ${progresso}% (${feitos}/${total} tarefas)\n` +
        `Data: ${entrega.toLocaleDateString("pt-BR")}\n\n` +
        `_Verifique os detalhes no painel da marcenaria._`
      );
    }
  }

  revalidatePath(`/projetos/${projetoId}`);
  revalidatePath("/projetos");
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
  return novoItem.id;
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
    include: { cliente: true, itens: true }
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
          data: { nome: clienteNome, telefone: clienteTelefone }
        }
      }
    }
  });

  // Alerta se nova data cair nos próximos 7 dias
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const novaData = new Date(dataEntrega);
  novaData.setHours(0, 0, 0, 0);
  const diff = Math.ceil((novaData.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));

  if (diff >= 0 && diff <= 7 && !["Finalizado", "Arquivado"].includes(status)) {
    const feitos = projeto.itens.filter(i => i.feito).length;
    const total = projeto.itens.length;
    const progresso = total > 0 ? Math.round((feitos / total) * 100) : 0;

    const prefixo = diff === 0 ? "🚩 *ENTREGA HOJE*" :
                    diff === 1 ? "🚨 *ENTREGA AMANHÃ*" :
                    `📅 *PRAZO EM ${diff} DIAS*`;

    await enviarMensagemWhatsApp(
      `${prefixo} _(data atualizada)_\n\n` +
      `Projeto: *${nome}*\n` +
      `Cliente: *${clienteNome}*\n` +
      `Progresso: ${progresso}% (${feitos}/${total} tarefas)\n` +
      `Nova data: ${novaData.toLocaleDateString("pt-BR")}\n\n` +
      `_Verifique os detalhes no painel._`
    );
  }

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

export async function salvarImagemProjeto(formData: FormData) {
  const projetoId = parseInt(formData.get("projetoId") as string);
  const imagemUrl = formData.get("imagemUrl") as string;

  await prisma.projeto.update({
    where: { id: projetoId },
    data: { fotoUrl: imagemUrl || null }
  });

  revalidatePath(`/projetos/${projetoId}`);
}