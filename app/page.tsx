import { prisma } from "@/lib/db"
import Link from "next/link"
import { formatarData } from "@/lib/utils"
import { AlertTriangle, ArrowRight, Calendar, Package, FolderOpen, Clock } from "lucide-react"

export default async function Dashboard() {
  const [projetos, materiais] = await Promise.all([
    prisma.projeto.findMany({
      where: { status: { not: "Arquivado" } },
      include: { cliente: true, itens: true },
      orderBy: { criadoEm: "desc" },
    }),
    prisma.material.findMany(),
  ])

  const hoje = new Date()

  const emAndamento = projetos.filter(p => p.status !== "Finalizado").length
  const finalizados = projetos.filter(p => p.status === "Finalizado").length

  const entregasSemana = projetos.filter(p => {
    const entrega = new Date(p.dataEntrega)
    const diff = (entrega.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)
    return diff >= 0 && diff <= 7 && p.status !== "Finalizado"
  })

  const estoquesCriticos = materiais.filter(m => m.quantidade === 0)
  const estoquesBaixos = materiais.filter(m => m.quantidade > 0 && m.quantidade <= m.minimo)

  const projetosRecentes = projetos.slice(0, 3)

  const proximasEntregas = projetos
    .filter(p => {
      const diff = (new Date(p.dataEntrega).getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)
      return diff >= 0 && diff <= 7 && p.status !== "Finalizado"
    })
    .sort((a, b) => new Date(a.dataEntrega).getTime() - new Date(b.dataEntrega).getTime())
    .slice(0, 4)

  function getProgresso(itens: { feito: boolean }[]) {
    if (itens.length === 0) return 0
    return Math.round((itens.filter(i => i.feito).length / itens.length) * 100)
  }

  function getDiasRestantes(data: Date | string) {
    const diff = (new Date(data).getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)
    if (diff < 0) return "Atrasado"
    if (diff < 1) return "Hoje"
    if (diff < 2) return "Amanhã"
    return `${Math.ceil(diff)}d`
  }

  return (
    <div className="space-y-8">

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-800/50 pb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-mono text-zinc-600 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">
              OVERVIEW
            </span>
            <span className="text-[10px] font-mono text-zinc-600">
              {hoje.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
            </span>
          </div>
          <h1 className="text-4xl font-bold tracking-tighter text-white">Dashboard</h1>
          <p className="text-zinc-500 text-sm mt-1">
            Terminal de gestão <span className="text-zinc-300 font-medium">MadeiriteAPP</span>
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Sistema online
          </span>
          <span className="text-zinc-700">·</span>
          <span>{projetos.length} projetos cadastrados</span>
        </div>
      </header>

      {/* Alertas críticos */}
      {(estoquesCriticos.length > 0 || entregasSemana.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {estoquesCriticos.length > 0 && (
            <Link href="/estoque" className="flex items-start gap-3 bg-red-500/5 border border-red-500/20 rounded-2xl p-4 hover:bg-red-500/10 transition-colors">
              <AlertTriangle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-red-400 uppercase tracking-widest mb-1">Estoque zerado</p>
                <p className="text-xs text-red-300/60">
                  {estoquesCriticos.map(m => m.nome).join(", ")}
                </p>
              </div>
            </Link>
          )}
          {entregasSemana.length > 0 && (
            <Link href="/calendario" className="flex items-start gap-3 bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 hover:bg-amber-500/10 transition-colors">
              <Clock size={16} className="text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-1">
                  {entregasSemana.length} {entregasSemana.length === 1 ? "entrega" : "entregas"} essa semana
                </p>
                <p className="text-xs text-amber-300/60">
                  {entregasSemana.map(p => p.nome).join(", ")}
                </p>
              </div>
            </Link>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<FolderOpen size={16} />}
          label="Em andamento"
          value={String(emAndamento).padStart(2, "0")}
          sub={`${finalizados} finalizados`}
        />
        <StatCard
          icon={<Calendar size={16} />}
          label="Entregas essa semana"
          value={String(entregasSemana.length).padStart(2, "0")}
          sub={entregasSemana.length > 0 ? "requer atenção" : "tudo tranquilo"}
          color={entregasSemana.length > 0 ? "text-amber-400" : "text-white"}
        />
        <StatCard
          icon={<Package size={16} />}
          label="Estoque baixo"
          value={String(estoquesBaixos.length).padStart(2, "0")}
          sub={`${estoquesCriticos.length} zerados`}
          color={estoquesBaixos.length > 0 ? "text-amber-400" : "text-white"}
        />
        <StatCard
          icon={<FolderOpen size={16} />}
          label="Total de projetos"
          value={String(projetos.length).padStart(2, "0")}
          sub="ativos no sistema"
        />
      </div>

      {/* Layout de duas colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Projetos recentes — ocupa 2/3 */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
              Projetos recentes
            </p>
            <Link href="/projetos" className="flex items-center gap-1 text-[10px] font-mono text-zinc-500 hover:text-white uppercase tracking-widest transition-colors">
              Ver todos <ArrowRight size={10} />
            </Link>
          </div>

          {projetosRecentes.length === 0 ? (
            <div className="border border-dashed border-zinc-800 rounded-2xl p-12 text-center">
              <p className="text-zinc-600 text-xs uppercase tracking-widest">
                Nenhum projeto cadastrado
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {projetosRecentes.map((p) => {
                const progresso = getProgresso(p.itens)
                const diasRestantes = getDiasRestantes(p.dataEntrega)
                const atrasado = diasRestantes === "Atrasado"

                return (
                  <Link
                    key={p.id}
                    href={`/projetos/${p.id}`}
                    className="group flex items-center gap-4 bg-zinc-900/40 border border-zinc-800 rounded-2xl p-4 hover:border-zinc-600 transition-all duration-300"
                  >
                    {/* Status dot */}
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      p.status === "Finalizado" ? "bg-emerald-500" :
                      p.status === "Aguardando Material" ? "bg-amber-500" : "bg-orange-400"
                    }`} />

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold text-white truncate">{p.nome}</p>
                        <span className={`text-[10px] font-mono ml-2 flex-shrink-0 ${
                          atrasado ? "text-red-400" :
                          diasRestantes === "Hoje" || diasRestantes === "Amanhã" ? "text-amber-400" :
                          "text-zinc-500"
                        }`}>
                          {diasRestantes}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-white rounded-full"
                            style={{ width: `${progresso}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-mono text-zinc-500 flex-shrink-0">{progresso}%</span>
                      </div>
                    </div>

                    <ArrowRight size={14} className="text-zinc-700 group-hover:text-zinc-400 transition-colors flex-shrink-0" />
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* Próximas entregas — ocupa 1/3 */}
        <div className="space-y-4">
          <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
            Próximas entregas
          </p>

          {proximasEntregas.length === 0 ? (
            <div className="border border-dashed border-zinc-800 rounded-2xl p-8 text-center">
              <p className="text-zinc-600 text-[10px] uppercase tracking-widest">
                Nenhuma entrega<br />nos próximos 7 dias
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {proximasEntregas.map((p) => {
                const dias = getDiasRestantes(p.dataEntrega)
                const urgente = dias === "Hoje" || dias === "Amanhã"
                return (
                  <Link
                    key={p.id}
                    href={`/projetos/${p.id}`}
                    className={`block p-4 rounded-2xl border transition-all hover:opacity-80 ${
                      urgente
                        ? "bg-amber-500/5 border-amber-500/20"
                        : "bg-zinc-900/40 border-zinc-800"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-medium text-white truncate">{p.nome}</p>
                      <span className={`text-[10px] font-mono flex-shrink-0 ${
                        urgente ? "text-amber-400" : "text-zinc-500"
                      }`}>
                        {dias}
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-500 mt-1">{p.cliente.nome}</p>
                    <p className="text-[10px] font-mono text-zinc-600 mt-1">
                      {formatarData(p.dataEntrega)}
                    </p>
                  </Link>
                )
              })}
            </div>
          )}

          {/* Mini resumo estoque */}
          <div className="mt-6 pt-4 border-t border-zinc-800/50">
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-3">
              Estoque
            </p>
            <div className="space-y-2">
              {estoquesCriticos.slice(0, 2).map(m => (
                <div key={m.id} className="flex items-center justify-between">
                  <span className="text-xs text-zinc-400 truncate">{m.nome}</span>
                  <span className="text-[10px] font-mono text-red-400 flex-shrink-0 ml-2">ZERADO</span>
                </div>
              ))}
              {estoquesBaixos.slice(0, 2).map(m => (
                <div key={m.id} className="flex items-center justify-between">
                  <span className="text-xs text-zinc-400 truncate">{m.nome}</span>
                  <span className="text-[10px] font-mono text-amber-400 flex-shrink-0 ml-2">BAIXO</span>
                </div>
              ))}
              {estoquesCriticos.length === 0 && estoquesBaixos.length === 0 && (
                <p className="text-[10px] text-zinc-600 uppercase tracking-widest">Tudo ok</p>
              )}
              <Link href="/estoque" className="block text-[10px] font-mono text-zinc-600 hover:text-zinc-400 uppercase tracking-widest transition-colors mt-1">
                Ver estoque completo →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, sub, color = "text-white" }: {
  icon: React.ReactNode
  label: string
  value: string
  sub: string
  color?: string
}) {
  return (
    <div className="group relative bg-zinc-900/40 border border-zinc-800 p-5 rounded-2xl transition-all duration-300 hover:border-zinc-600 hover:bg-zinc-900/60 hover:translate-y-[-2px]">
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
      <div className="flex items-center justify-between mb-3 relative z-10">
        <span className="text-zinc-600 group-hover:text-zinc-400 transition-colors">{icon}</span>
        <div className="w-1.5 h-1.5 rounded-full bg-zinc-700 group-hover:bg-white animate-pulse transition-colors" />
      </div>
      <p className={`text-3xl font-bold tracking-tighter mb-1 relative z-10 ${color}`}>
        {value}
      </p>
      <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider relative z-10">
        {label}
      </p>
      <p className="text-[10px] text-zinc-600 mt-1 relative z-10">{sub}</p>
    </div>
  )
}