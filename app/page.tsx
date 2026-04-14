import { prisma } from "@/lib/db"
import Link from "next/link"
import { formatarData } from "@/lib/utils"
import { 
  AlertTriangle, ArrowRight, Calendar, Package, 
  FolderOpen, Clock, CheckSquare, Activity, 
  PackageX, Wrench, CheckCircle2, User 
} from "lucide-react"

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
  hoje.setHours(0, 0, 0, 0)

  const emAndamento = projetos.filter(p => p.status !== "Finalizado").length
  const entregasSemana = projetos.filter(p => {
    const entrega = new Date(p.dataEntrega)
    const diff = (entrega.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)
    return diff >= 0 && diff <= 7 && p.status !== "Finalizado"
  })

  const estoquesCriticos = materiais.filter(m => m.quantidade === 0)
  const estoquesBaixos = materiais.filter(m => m.quantidade > 0 && m.quantidade <= m.minimo)
  const projetosRecentes = projetos.slice(0, 3)
  

  // Métrica de exemplo para tarefas hoje (Você pode filtrar seus ChecklistItems por data de conclusão se tiver)
  const tarefasHoje = 12 
  const totalTarefasHoje = 15

  function getProgresso(itens: { feito: boolean }[]) {
    if (itens.length === 0) return 0
    return Math.round((itens.filter(i => i.feito).length / itens.length) * 100)
  }

  function getDiasRestantes(data: Date | string, status: string) {
  if (status === "Finalizado") return "Finalizado"
  const diff = (new Date(data).getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)
  if (diff < 0) return "Atrasado"
  if (diff < 1) return "Hoje"
  if (diff < 2) return "Amanhã"
  return `${Math.ceil(diff)}d`
}

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-800/50 pb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-mono text-zinc-500 bg-zinc-900 px-2 py-1 rounded border border-zinc-800 tracking-widest">
              OVERVIEW
            </span>
            <span className="text-[10px] font-mono text-zinc-600 uppercase">
              {hoje.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
            </span>
          </div>
          <h1 className="text-4xl font-bold tracking-tighter text-white">Dashboard</h1>
          <p className="text-zinc-500 text-sm mt-1">
            Terminal de gestão <span className="text-zinc-300 font-medium">MadeiriteAPP</span>
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5 text-emerald-500 font-medium bg-emerald-500/5 px-3 py-1.5 rounded-full border border-emerald-500/10">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Sistema online
          </span>
          <span className="text-zinc-500">{projetos.length} projetos ativos</span>
        </div>
      </header>

      {/* Alertas críticos */}
      {(estoquesCriticos.length > 0 || entregasSemana.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {estoquesCriticos.length > 0 && (
            <Link href="/estoque" className="group flex items-start gap-4 bg-red-500/5 border border-red-500/20 rounded-2xl p-4 hover:bg-red-500/10 transition-all">
              <div className="bg-red-500/20 p-2 rounded-lg">
                <AlertTriangle size={18} className="text-red-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-red-400 uppercase tracking-widest mb-1">Estoque crítico</p>
                <p className="text-sm text-red-300/80 font-medium">
                  {estoquesCriticos.map(m => m.nome).join(", ")}
                </p>
              </div>
            </Link>
          )}
          {entregasSemana.length > 0 && (
            <Link href="/calendario" className="group flex items-start gap-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 hover:bg-amber-500/10 transition-all">
              <div className="bg-amber-500/20 p-2 rounded-lg">
                <Clock size={18} className="text-amber-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-1">Entregas próximas</p>
                <p className="text-sm text-amber-300/80 font-medium">
                  {entregasSemana.length} {entregasSemana.length === 1 ? "projeto requer" : "projetos requerem"} atenção imediata
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
          sub="produção ativa"
        />
        <StatCard
          icon={<Calendar size={16} />}
          label="Esta semana"
          value={String(entregasSemana.length).padStart(2, "0")}
          sub="prazos críticos"
          color={entregasSemana.length > 0 ? "text-amber-400" : "text-white"}
        />
        <StatCard
          icon={<Package size={16} />}
          label="Estoque baixo"
          value={String(estoquesBaixos.length).padStart(2, "0")}
          sub={`${estoquesCriticos.length} itens zerados`}
          color={estoquesBaixos.length > 0 ? "text-amber-400" : "text-white"}
        />
        {/* Card de Ritmo de Produção com Hover Animado */}
        <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-2xl relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_10px_30px_-15px_rgba(16,185,129,0.1)]">
          <div className="absolute top-0 right-0 p-4 opacity-5 text-emerald-500 group-hover:opacity-20 group-hover:scale-110 group-hover:-rotate-12 transition-all duration-500">
            <CheckSquare size={48} />
          </div>
          
          <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] group-hover:animate-ping" />
            Ritmo Hoje
          </div>
          
          <div className="text-4xl font-bold text-white tracking-tighter group-hover:text-emerald-400 transition-colors">
            {tarefasHoje}<span className="text-lg text-zinc-700 font-normal">/{totalTarefasHoje}</span>
          </div>
          <p className="text-[10px] text-zinc-600 mt-2 font-mono uppercase">Tarefas concluídas</p>
        </div>
      </div>

      {/* Layout de duas colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lado Esquerdo: Projetos Recentes */}
        <div className="lg:col-span-2 space-y-5">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Activity size={14} className="text-zinc-500" />
              <h2 className="text-[10px] font-mono text-zinc-400 uppercase tracking-[0.2em]">Painel de Operações</h2>
            </div>
            <Link href="/projetos" className="text-[10px] font-mono text-zinc-600 hover:text-white uppercase tracking-widest transition-colors flex items-center gap-1">
              Ver todos <ArrowRight size={10} />
            </Link>
          </div>

          <div className="space-y-3">
            {projetosRecentes.map((p) => {
              const progresso = getProgresso(p.itens)
              const dias = getDiasRestantes(p.dataEntrega, p.status)
              const isAtrasado = dias === "Atrasado"
              const tasksPendentes = p.status === "Finalizado" && p.itens.some(i => !i.feito)

              return (
                <Link key={p.id} href={`/projetos/${p.id}`} className="group block bg-zinc-900/30 border border-zinc-800/50 hover:border-zinc-700 hover:bg-zinc-900/50 p-4 rounded-2xl transition-all">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-zinc-950 flex items-center justify-center border border-zinc-800 text-zinc-500 font-bold group-hover:border-amber-500/50 group-hover:text-amber-500 transition-all">
                        {p.cliente.nome.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-white font-semibold text-base group-hover:text-amber-400 transition-colors">
                          {p.nome}
                        </h3>
                        {tasksPendentes && (
                          <div
                            title="Projeto finalizado com tasks pendentes"
                            className="flex items-center gap-1 bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[9px] font-mono px-1.5 py-0.5 rounded"
                          >
                            <AlertTriangle size={10} />
                            Tasks Pendentes
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-6 md:w-1/3">
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-[10px] font-mono text-zinc-500 uppercase">Progresso</span>
                          <span className="text-xs font-bold text-zinc-300">{progresso}%</span>
                        </div>
                        <div className="h-2 w-full bg-zinc-950 rounded-full overflow-hidden p-[1px] border border-zinc-800">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ${
                              dias === "Atrasado"   ? "bg-red-500" :
                              dias === "Finalizado" && tasksPendentes ? "bg-orange-500" :
                              dias === "Finalizado" ? "bg-emerald-500" :
                              "bg-amber-500"
                            }`}
                            style={{ width: `${progresso}%` }}
                          />
                        </div>
                      </div>
                      <div className={`text-xs font-bold font-mono px-3 py-1 rounded-lg border ${
                        dias === "Atrasado"   ? "bg-red-500/10 text-red-500 border-red-500/20" :
                        dias === "Hoje"       ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                        dias === "Amanhã"     ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                        dias === "Finalizado" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                                                "bg-zinc-800/50 text-zinc-500 border-zinc-700/50"
                      }`}>
                        {dias.toUpperCase()}
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Lado Direito: Radar e Estoque */}
        <div className="space-y-6">
          <div className="bg-zinc-950/50 border border-zinc-800/50 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Activity size={16} className="text-zinc-600" />
              <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Radar da Oficina</h2>
            </div>
            
            <div className="space-y-6">
              {/* Logs estáticos para exemplo - criar um model no Prisma depois para Atividade!!! */}
              <ActivityItem icon={PackageX} color="text-red-400" bg="bg-red-400/10" title="Pregos 18mm esgotados" time="Agora" />
              <ActivityItem icon={Wrench} color="text-amber-400" bg="bg-amber-400/10" title="Iniciada montagem: Armário Jose" time="Há 12m" />
              <ActivityItem icon={CheckCircle2} color="text-emerald-400" bg="bg-emerald-400/10" title="Checklist concluído: Giovanna" time="Há 2h" isLast />
            </div>
          </div>

          <div className="bg-zinc-900/20 border border-zinc-800/50 rounded-2xl p-5">
            <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-4">Atenção no Estoque</h2>
            <div className="space-y-3">
              {estoquesCriticos.concat(estoquesBaixos).slice(0, 4).map(m => (
                <div key={m.id} className="flex items-center justify-between group">
                  <span className="text-xs text-zinc-400 group-hover:text-zinc-200 transition-colors">{m.nome}</span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                    m.quantidade === 0 ? 'bg-red-500/5 text-red-500 border-red-500/20' : 'bg-amber-500/5 text-amber-500 border-amber-500/20'
                  }`}>
                    {m.quantidade === 0 ? 'ZERADO' : 'BAIXO'}
                  </span>
                </div>
              ))}
              <Link href="/estoque" className="block text-[10px] font-mono text-zinc-600 hover:text-amber-500 transition-colors pt-2 uppercase tracking-widest">
                Gerenciar Inventário →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Sub-componentes auxiliares
function StatCard({ icon, label, value, sub, color = "text-white" }: {
  icon: React.ReactNode; label: string; value: string; sub: string; color?: string
}) {
  return (
    <div className="group bg-zinc-950 border border-zinc-800 p-5 rounded-2xl transition-all duration-300 hover:border-zinc-700 hover:-translate-y-2 hover:shadow-[0_10px_30px_-15px_rgba(0,0,0,0.5)]">
      <div className="flex items-center justify-between mb-3">
        {/* O ícone sobe um pouco mais rápido que o card para dar um efeito elástico */}
        <span className="text-zinc-600 group-hover:text-amber-500 group-hover:-translate-y-1 transition-all duration-300">
          {icon}
        </span>
        <div className="w-1 h-1 rounded-full bg-zinc-800 group-hover:bg-amber-500 transition-colors" />
      </div>
      <p className={`text-4xl font-bold tracking-tighter mb-1 ${color}`}>{value}</p>
      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{label}</p>
      <p className="text-[10px] text-zinc-700 mt-1 font-medium group-hover:text-zinc-500 transition-colors">{sub}</p>
    </div>
  )
}

function ActivityItem({ icon: Icon, color, bg, title, time, isLast = false }: any) {
  return (
    <div className="flex gap-4 items-start relative">
      {!isLast && <div className="absolute top-8 bottom-[-24px] left-4 w-[1px] bg-zinc-900" />}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-zinc-800 ${bg} ${color} relative z-10`}>
        <Icon size={14} />
      </div>
      <div className="pt-1">
        <p className="text-xs text-zinc-300 font-medium">{title}</p>
        <p className="text-[10px] text-zinc-600 font-mono mt-1">{time}</p>
      </div>
    </div>
  )
}