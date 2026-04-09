import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Calendar, User, Clock, CheckCircle2, Circle } from "lucide-react";
import { toggleItemStatus, updateAnotacoes, adicionarItem } from "./actions";
import { AnotacoesAutoSave } from "@/components/anotacoes-auto-save";

type Props = {
    params: Promise<{ id: string }>;
};

export default async function DetalheProjetoPage({ params }: Props) {
    const resolvedParams = await params;
    const projetoId = parseInt(resolvedParams.id);

    if (isNaN(projetoId)) return notFound();

    const projeto = await prisma.projeto.findUnique({
        where: { id: projetoId },
        include: {
            cliente: true,
            itens: { orderBy: { ordem: 'asc' } }
        },
    });

    if (!projeto) return notFound();

    const total = projeto.itens.length;
    const feitos = projeto.itens.filter((i) => i.feito).length;
    const progresso = total > 0 ? Math.round((feitos / total) * 100) : 0;

    return (
        <div className="max-w-5xl mx-auto space-y-8 p-6">
            {/* Botão Voltar */}
            <Link href="/projetos" className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-xs font-mono tracking-widest">
                <ChevronLeft size={14} /> VOLTAR PARA LISTA
            </Link>

            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-zinc-800/50 pb-8">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-mono text-zinc-500 border border-zinc-800 px-2 py-0.5 rounded uppercase">
                            Reference: #{String(projeto.id).padStart(4, "0")}
                        </span>
                        <StatusBadge status={projeto.status} />
                    </div>
                    <h1 className="text-4xl font-bold tracking-tighter text-white">
                        {projeto.nome}
                    </h1>
                    <div className="flex flex-wrap gap-6 text-zinc-400 text-xs">
                        <span className="flex items-center gap-2 bg-zinc-900/50 px-3 py-1.5 rounded-lg border border-zinc-800">
                            <User size={14} className="text-zinc-600" /> {projeto.cliente.nome}
                        </span>
                        <span className="flex items-center gap-2 bg-zinc-900/50 px-3 py-1.5 rounded-lg border border-zinc-800">
                            <Calendar size={14} className="text-zinc-600" />
                            Entrega: {new Date(projeto.dataEntrega).toLocaleDateString('pt-PT')}
                        </span>
                    </div>
                </div>

                <div className="text-right">
                    <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.3em] mb-1">Status de Execução</p>
                    <p className="text-5xl font-black text-white tabular-nums">{progresso}%</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Checklist Principal */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-2 ml-1">
                        <CheckCircle2 size={14} /> Tasks de Produção
                    </h3>

                    {/* Formulário adicionar item */}
                    <form action={adicionarItem} className="flex gap-2">
                        <input type="hidden" name="projetoId" value={projeto.id} />
                        <input
                            name="titulo"
                            required
                            placeholder="Nova task... ex: Cortar MDF"
                            className="flex-1 bg-zinc-900/20 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-zinc-600 outline-none transition-all"
                        />
                        <button
                            type="submit"
                            className="px-4 py-2.5 bg-white text-black text-xs font-bold rounded-xl hover:bg-zinc-200 transition-all active:scale-95"
                        >
                            + Add
                        </button>
                    </form>

                    {/* Lista de itens */}
                    <div className="grid gap-3">
                        {projeto.itens.length === 0 ? (
                            <p className="text-zinc-700 text-xs uppercase tracking-widest text-center py-8 border border-dashed border-zinc-800 rounded-2xl">
                                Nenhuma task adicionada
                            </p>
                        ) : (
                            projeto.itens.map((item) => (
                                <form key={item.id} action={toggleItemStatus}>
                                    <input type="hidden" name="itemId" value={item.id} />
                                    <input type="hidden" name="projetoId" value={projeto.id} />
                                    <button
                                        type="submit"
                                        className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 group ${item.feito
                                            ? "bg-zinc-950/40 border-zinc-900 opacity-50"
                                            : "bg-zinc-900/20 border-zinc-800 hover:border-zinc-600 hover:bg-zinc-900/40"
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`p-1 rounded-full border ${item.feito
                                                ? "bg-emerald-500/20 border-emerald-500/50"
                                                : "border-zinc-700 group-hover:border-zinc-500"
                                                }`}>
                                                {item.feito
                                                    ? <CheckCircle2 className="text-emerald-500" size={18} />
                                                    : <div className="w-[18px] h-[18px]" />
                                                }
                                            </div>
                                            <span className={`text-sm tracking-tight ${item.feito
                                                ? "text-zinc-600 line-through"
                                                : "text-zinc-200 font-medium"
                                                }`}>
                                                {item.titulo}
                                            </span>
                                        </div>
                                    </button>
                                </form>
                            ))
                        )}
                    </div>
                </div>

                {/* Sidebar de Observações */}
                <div className="space-y-6">
                    <AnotacoesAutoSave
                        projetoId={projeto.id}
                        valorInicial={projeto.anotacoes}
                    />
                </div>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const isPending = status === "Em andamento" || status === "Aguardando Material";
    return (
        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${isPending ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            }`}>
            {status.toUpperCase()}
        </span>
    );
}