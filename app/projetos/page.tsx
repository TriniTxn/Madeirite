import { prisma } from "@/lib/db"
import { Search, Filter, Plus, MessageCircle, Calendar, ChevronRight, LayoutGrid } from "lucide-react"
import { ModalNovoProjeto } from "@/components/modal-novo-projeto"
import Link from "next/link"
import { formatarData } from "@/lib/utils"

export default async function ProjetosPage() {
  const projetos = await prisma.projeto.findMany({
    include: { cliente: true, itens: true },
    orderBy: { criadoEm: "desc" }
  })

  // Separar por grupo
  const ativos = projetos.filter(p => p.status === "Em Produção" || p.status === "Aguardando Material")
  const finalizados = projetos.filter(p => p.status === "Finalizado")
  const arquivados = projetos.filter(p => p.status === "Arquivado")

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto">
      {/* Header — mantém igual */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-zinc-800/50 pb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <LayoutGrid size={14} className="text-zinc-500" />
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em]">Gestão de Pedidos</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tighter text-white">Projetos</h1>
          <p className="text-zinc-500 text-sm mt-1">Acompanhe a linha de produção em tempo real.</p>
        </div>
        <ModalNovoProjeto />
      </div>

      {/* Barra de Filtros — mantém igual */}
      <div className="flex flex-col md:flex-row items-center gap-4 p-3 bg-zinc-950/50 border border-zinc-800/50 rounded-2xl shadow-xl">
        <div className="flex-1 w-full relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
          <input
            type="text"
            placeholder="Pesquisar por projeto ou cliente..."
            className="w-full bg-zinc-900/30 border-none focus:ring-1 focus:ring-amber-500/30 rounded-xl text-sm text-zinc-300 pl-12 h-11 transition-all"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold text-zinc-400 bg-zinc-900/50 border border-zinc-800 rounded-xl hover:text-white hover:border-zinc-600 transition-all">
            <Filter size={14} />
            FILTRAR STATUS
          </button>
        </div>
      </div>

      {/* Seção: Ativos */}
      <SecaoProjetoS
        titulo="Em Produção"
        subtitulo="Projetos ativos na linha de produção"
        cor="text-amber-400"
        dot="bg-amber-500"
        projetos={ativos}
      />

      {/* Seção: Finalizados */}
      {finalizados.length > 0 && (
        <SecaoProjetoS
          titulo="Finalizados"
          subtitulo="Projetos concluídos"
          cor="text-emerald-400"
          dot="bg-emerald-500"
          projetos={finalizados}
        />
      )}

      {/* Seção: Arquivados */}
      {arquivados.length > 0 && (
        <SecaoProjetoS
          titulo="Arquivados"
          subtitulo="Histórico de projetos encerrados"
          cor="text-zinc-500"
          dot="bg-zinc-600"
          projetos={arquivados}
          opaco
        />
      )}
    </div>
  )
}

// Nova seção reutilizável
function SecaoProjetoS({
  titulo, subtitulo, cor, dot, projetos, opaco = false
}: {
  titulo: string
  subtitulo: string
  cor: string
  dot: string
  projetos: any[]
  opaco?: boolean
}) {
  return (
    <div className={`space-y-4 ${opaco ? "opacity-60 hover:opacity-100 transition-opacity duration-300" : ""}`}>
      {/* Cabeçalho da seção */}
      <div className="flex items-center gap-3 px-1">
        <div className={`w-1.5 h-1.5 rounded-full ${dot}`} />
        <h2 className={`text-xs font-bold uppercase tracking-[0.2em] font-mono ${cor}`}>
          {titulo}
        </h2>
        <span className="text-[10px] font-mono text-zinc-600 bg-zinc-900 px-2 py-0.5 rounded-full border border-zinc-800">
          {projetos.length}
        </span>
        <div className="flex-1 h-px bg-zinc-800/50" />
        <span className="text-[10px] text-zinc-600">{subtitulo}</span>
      </div>

      {/* Cards ou estado vazio */}
      {projetos.length === 0 ? (
        <div className="border border-dashed border-zinc-800 rounded-2xl p-12 text-center">
          <p className="text-zinc-600 text-xs font-mono uppercase tracking-widest">
            Nenhum projeto nesta etapa
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projetos.map((projeto) => {
            const total = projeto.itens.length
            const feitos = projeto.itens.filter((i: any) => i.feito).length
            const progresso = total > 0 ? Math.round((feitos / total) * 100) : 0
            return (
              <ProjetoCard
                key={projeto.id}
                projeto={projeto}
                progresso={progresso}
                feitos={feitos}
                total={total}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

function ProjetoCard({ projeto, progresso, feitos, total }: any) {
  const hoje = new Date()
  const entrega = new Date(projeto.dataEntrega)
  const diffDias = Math.ceil((entrega.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
  const isAtrasado = diffDias < 0 && projeto.status !== "Finalizado"

  return (
    /* CONTAINER PRINCIPAL: Agora com fundo sólido e hover de subida */
    <div className="group relative bg-[#09090b] border border-zinc-800 rounded-2xl p-6 transition-all duration-300 
                    hover:border-zinc-400 hover:-translate-y-2 hover:shadow-[0_20px_40px_-20px_rgba(0,0,0,0.8)]">
      
      {/* HEADER: Data e ID com contraste */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex flex-col gap-1">
          <StatusBadge status={projeto.status} />
          <span className="text-[10px] font-mono text-zinc-600">ID-{String(projeto.id).padStart(4, "0")}</span>
        </div>
        
        <div className={`text-right ${
          isAtrasado ? "text-red-500" :
          projeto.status === "Finalizado" ? "text-emerald-500" :
          "text-zinc-500"
        }`}>
          <div className="flex items-center justify-end gap-1 text-[10px] font-bold uppercase tracking-wider">
            <Calendar size={12} />
            {projeto.status === "Finalizado" ? "Finalizado" :
            isAtrasado ? "Atrasado" :
            diffDias === 0 ? "Hoje" :
            `Em ${diffDias}d`}
          </div>
          <span className="text-[9px] font-mono opacity-60">{formatarData(projeto.dataEntrega)}</span>
        </div>
      </div>

      {/* TÍTULO: Branco real para leitura imediata */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-white group-hover:text-amber-500 transition-colors truncate">
          {projeto.nome}
        </h3>
        <p className="text-zinc-500 text-sm mt-1 font-medium">{projeto.cliente.nome}</p>
      </div>

      {/* PROGRESSO: Estilo "Capsule" mais moderno */}
      <div className="space-y-3 mb-6">
        <div className="flex justify-between items-end">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
            {feitos} de {total} tarefas
          </span>
          <span className="text-lg font-black text-white">{progresso}%</span>
        </div>
        <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800/50">
          <div
            className={`h-full transition-all duration-1000 ease-out ${
              isAtrasado ? 'bg-red-600' : 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
            }`}
            style={{ width: `${progresso}%` }}
          />
        </div>
      </div>

      {/* RODAPÉ: Ações com hover individual */}
      <div className="pt-4 border-t border-zinc-800/50 flex justify-between items-center">
          <button className="p-2 rounded-lg text-zinc-600 hover:text-emerald-500 hover:bg-emerald-500/5 transition-all">
            <MessageCircle size={18} />
          </button>
          
          <Link
            href={`/projetos/${projeto.id}`}
            className="flex items-center gap-2 text-xs font-bold text-zinc-400 group-hover:text-white transition-all"
          >
            DETALHES 
            <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    "Finalizado": "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    "Aguardando Material": "bg-amber-500/10 text-amber-500 border-amber-500/20",
    "Em andamento": "bg-orange-500/10 text-orange-400 border-orange-500/20",
  }

  return (
    <div className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-md text-[9px] font-black border uppercase tracking-tighter ${styles[status] || styles["Em andamento"]}`}>
      <span className="w-1 h-1 rounded-full bg-current animate-pulse" />
      {status}
    </div>
  )
}