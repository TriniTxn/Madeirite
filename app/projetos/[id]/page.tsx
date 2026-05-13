import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Calendar, User } from "lucide-react";
import { AnotacoesAutoSave } from "@/components/anotacoes-auto-save";
import { ModalEditarProjeto } from "@/components/modal-editar-projeto";
import { ChecklistDraggable } from "@/components/checklist-draggable";
import { formatarData } from "@/lib/utils";
import { ImagemProjeto, DestaqueInterativo } from "@/components/imagem-projeto";

type Props = {
    params: Promise<{ id: string }>;
};

export default async function DetalheProjetoPage({ params }: Props) {
    const { id } = await params;
    const projetoId = parseInt(id);

    const projeto = await prisma.projeto.findUnique({
        where: { id: projetoId },
        include: {
            cliente: true,
            itens: { orderBy: { ordem: 'asc' } },
            imagens: { orderBy: { ordem: 'asc' } },
        },
    });

    if (!projeto) return notFound();

    const feitos = projeto.itens.filter((i) => i.feito).length;
    const progresso = projeto.itens.length > 0 ? Math.round((feitos / projeto.itens.length) * 100) : 0;

    const fotoDestaque = projeto.imagens[0];

    return (
        <div className="max-w-7xl mx-auto space-y-6 p-6 pb-20">

            {/* NAVEGAÇÃO TOPO */}
            <nav>
                <Link
                    href="/projetos"
                    className="group flex items-center gap-2 text-zinc-500 hover:text-white transition-all text-[10px] font-mono uppercase tracking-[0.3em]"
                >
                    <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                    Voltar para a lista
                </Link>
            </nav>

            {/* HEADER */}
            <header className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-6 bg-[#09090b] border border-zinc-800/50 p-8 rounded-[40px] shadow-2xl">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-mono text-zinc-500 border border-zinc-800/50 px-2 py-0.5 rounded uppercase">
                            REF: #{String(projeto.id).padStart(4, "0")}
                        </span>
                        <StatusBadge status={projeto.status} />
                        {/* Botão de editar separado por divisor */}
                        <div className="ml-2 border-l border-zinc-800/50 pl-4">
                            <ModalEditarProjeto projeto={projeto as any} />
                        </div>
                    </div>

                    <h1 className="text-6xl font-black tracking-tighter text-white uppercase italic leading-none">
                        {projeto.nome}
                    </h1>

                    <div className="flex flex-wrap gap-6 text-zinc-500 text-[10px] font-bold uppercase tracking-[0.15em]">
                        <span className="flex items-center gap-2"><User size={12} /> {projeto.cliente.nome}</span>
                        <span className="flex items-center gap-2"><Calendar size={12} /> {formatarData(projeto.dataEntrega)}</span>
                    </div>
                </div>

                <div className="lg:text-right border-t lg:border-t-0 lg:border-l border-zinc-800/50 pt-6 lg:pt-0 lg:pl-10">
                    <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.4em] mb-1">Execução</p>
                    <p className="text-8xl font-black text-white tabular-nums tracking-tighter leading-none">
                        {progresso}<span className="text-2xl text-zinc-800 ml-1">%</span>
                    </p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">

                <div className="lg:col-span-2 space-y-10">

                    {/* QUADRO PRINCIPAL */}
                    {fotoDestaque ? (
                        <DestaqueInterativo url={fotoDestaque.url} />
                    ) : (
                        <div className="w-full h-40 rounded-[40px] border border-dashed border-zinc-800/50 flex items-center justify-center text-zinc-600 font-mono text-[10px] uppercase tracking-widest">
                            Nenhuma imagem
                        </div>
                    )}

                    {/* LISTA DE TAREFAS */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3 ml-2">
                            <div className="w-1.5 h-4 bg-white rounded-full" />
                            <h3 className="text-[10px] font-mono text-zinc-400 uppercase tracking-[0.3em] font-black">Linha de Produção</h3>
                        </div>
                        <ChecklistDraggable itens={projeto.itens} projetoId={projeto.id} />
                    </section>
                </div>

                <aside className="space-y-8">
                    {/* Aqui o ImagemProjeto já tem a lógica de abrir o modal no clique */}
                    <ImagemProjeto projetoId={projeto.id} imagens={projeto.imagens} />

                    <AnotacoesAutoSave projetoId={projeto.id} valorInicial={projeto.anotacoes} />
                </aside>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        "Aprovando Projeto":   "bg-purple-500/10 text-purple-400 border-purple-500/20",
        "Aguardando Material": "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
        "Em Produção":         "bg-amber-500/10 text-amber-400 border-amber-500/20",
        "Pré Montagem":        "bg-orange-400/10 text-orange-300 border-orange-400/20",
        "Montagem":            "bg-orange-500/10 text-orange-400 border-orange-500/20",
        "Finalizado":          "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
        "Arquivado":           "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",
    }
    return (
        <span className={`text-[9px] font-black px-3 py-1 rounded-md border tracking-[0.1em] uppercase ${styles[status] ?? "bg-amber-500/10 text-amber-400 border-amber-500/20"}`}>
            {status}
        </span>
    );
}