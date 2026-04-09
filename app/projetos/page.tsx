import { prisma } from "@/lib/db"
import { Search, Filter, Plus } from "lucide-react"
import { ModalNovoProjeto } from "@/components/modal-novo-projeto"
import Link from "next/link"

export default async function ProjetosPage() {
  const projetos = await prisma.projeto.findMany({
    include: { cliente: true, itens: true },
    orderBy: { criadoEm: "desc" }
  })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tighter text-white">Projetos</h1>
          <p className="text-zinc-500 text-sm mt-1">Gerencie e acompanhe a execução dos pedidos.</p>
        </div>
        <ModalNovoProjeto />
      </div>

      {/* Barra de Filtros */}
      <div className="flex flex-wrap items-center gap-3 p-2 bg-zinc-900/30 border border-zinc-800 rounded-2xl">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
          <input
            type="text"
            placeholder="Buscar projeto..."
            className="w-full bg-transparent border-none focus:ring-0 text-sm text-zinc-300 pl-10"
          />
        </div>
        <div className="h-6 w-[1px] bg-zinc-800 hidden md:block" />
        <button className="flex items-center gap-2 px-4 py-1.5 text-xs font-medium text-zinc-400 hover:text-white transition-colors">
          <Filter size={14} />
          Filtrar por Status
        </button>
      </div>

      {/* Grid de Projetos */}
      {projetos.length === 0 ? (
        <div className="border border-dashed border-zinc-800 rounded-2xl p-20 text-center">
          <p className="text-zinc-600 text-xs uppercase tracking-widest">
            Nenhum projeto detectado
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projetos.map((projeto) => {
            const total = projeto.itens.length
            const feitos = projeto.itens.filter((i) => i.feito).length
            const progresso = total > 0 ? Math.round((feitos / total) * 100) : 0

            return (
              <ProjetoCard
                key={projeto.id}
                id={projeto.id}
                titulo={projeto.nome}
                cliente={projeto.cliente.nome}
                status={projeto.status}
                progresso={progresso}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

function ProjetoCard({ id, titulo, cliente, status, progresso }: {
  id: number
  titulo: string
  cliente: string
  status: string
  progresso: number
}) {
  return (
    <div className="group bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-600 transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider bg-zinc-950 px-2 py-1 rounded-md border border-zinc-800">
          ID-{String(id).padStart(4, "0")}
        </span>
        <StatusBadge status={status} />
      </div>

      <h3 className="text-lg font-bold text-white mb-1 group-hover:text-zinc-200 transition-colors">
        {titulo}
      </h3>
      <p className="text-zinc-500 text-sm mb-6">{cliente}</p>

      <div className="space-y-2">
        <div className="flex justify-between text-[10px] font-mono uppercase tracking-widest text-zinc-500">
          <span>Progresso</span>
          <span>{progresso}%</span>
        </div>
        <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-white transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(255,255,255,0.3)]"
            style={{ width: `${progresso}%` }}
          />
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-zinc-800 flex justify-between items-center">
        <span className="text-xs font-medium text-zinc-400">{status}</span>
          <Link
            href={`/projetos/${id}`}
            className="text-xs text-white underline underline-offset-4 hover:text-zinc-300 transition-colors"
          >
          Ver detalhes
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
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${styles[status] || styles["Em andamento"]}`}>
      {status.toUpperCase()}
    </span>
  )
}