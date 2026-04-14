"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Clock, CalendarDays } from "lucide-react"
import Link from "next/link"
import { formatarData } from "@/lib/utils"

type Projeto = {
  id: number
  nome: string
  dataEntrega: Date | string
  status: string
}

type Props = {
  projetos: Projeto[]
}

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
]

const HOJE = new Date()
HOJE.setHours(0, 0, 0, 0)

export function CalendarioClient({ projetos }: Props) {
  const [mes, setMes] = useState(HOJE.getMonth())
  const [ano, setAno] = useState(HOJE.getFullYear())

  function mesAnterior() {
    if (mes === 0) { setMes(11); setAno(a => a - 1) }
    else setMes(m => m - 1)
  }

  function proximoMes() {
    if (mes === 11) { setMes(0); setAno(a => a + 1) }
    else setMes(m => m + 1)
  }

  const primeiroDia = new Date(ano, mes, 1).getDay()
  const totalDias = new Date(ano, mes + 1, 0).getDate()

  const celulas = [
    ...Array(primeiroDia).fill(null),
    ...Array.from({ length: totalDias }, (_, i) => i + 1),
  ]
  while (celulas.length % 7 !== 0) celulas.push(null)

  function projetosDoDia(dia: number) {
    return projetos.filter((p) => {
      const d = new Date(p.dataEntrega)
      return d.getUTCDate() === dia && d.getUTCMonth() === mes && d.getUTCFullYear() === ano
    })
  }

  function eHoje(dia: number) {
    return dia === HOJE.getDate() && mes === HOJE.getMonth() && ano === HOJE.getFullYear()
  }

  function isPrazoProximo(dia: number) {
    const diff = Math.ceil((new Date(ano, mes, dia).getTime() - HOJE.getTime()) / (1000 * 60 * 60 * 24))
    return diff >= 0 && diff <= 3
  }

  const alertas = projetos.filter(p => {
    const d = new Date(p.dataEntrega)
    const diff = (d.getTime() - HOJE.getTime()) / (1000 * 60 * 60 * 24)
    return diff >= 0 && diff <= 3 && p.status !== "Finalizado"
  })

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-800/50 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-mono text-zinc-600 bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded">
              CRONOGRAMA
            </span>
          </div>
          <h1 className="text-4xl font-bold tracking-tighter text-white">Calendário</h1>
          <p className="text-zinc-500 text-sm mt-1">Cronograma de montagens e entregas.</p>
        </div>

        {/* Navegação de mês */}
        <div className="flex items-center gap-2 bg-zinc-900/50 border border-zinc-800 p-1 rounded-xl">
          <button
            onClick={mesAnterior}
            className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-all"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="px-4 text-sm font-mono font-medium text-zinc-200 uppercase tracking-widest min-w-[160px] text-center">
            {MESES[mes]} {ano}
          </span>
          <button
            onClick={proximoMes}
            className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-all"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Alerta de prazos críticos */}
      {alertas.length > 0 && (
        <div className="flex items-start gap-3 bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4">
          <Clock size={14} className="text-amber-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1.5">
              {alertas.length} {alertas.length === 1 ? "entrega" : "entregas"} nos próximos 3 dias
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {alertas.map(p => (
                <Link
                  key={p.id}
                  href={`/projetos/${p.id}`}
                  className="text-xs text-amber-300/60 hover:text-amber-300 transition-colors"
                >
                  • {p.nome} — {formatarData(p.dataEntrega)}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Calendário */}
      <div className="border border-zinc-800/60 rounded-2xl overflow-hidden">

        {/* Cabeçalho dos dias */}
        <div className="grid grid-cols-7 bg-zinc-900/30 border-b border-zinc-800/60">
          {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((dia) => (
            <div
              key={dia}
              className="py-3 text-center text-[10px] font-mono text-zinc-600 uppercase tracking-[0.2em]"
            >
              {dia}
            </div>
          ))}
        </div>

        {/* Células */}
        <div className="grid grid-cols-7">
          {celulas.map((dia, i) => {
            const eventos = dia ? projetosDoDia(dia) : []
            const hoje = dia ? eHoje(dia) : false
            const prazoProximo = dia ? isPrazoProximo(dia) && eventos.some(p => p.status !== "Finalizado") : false

            return (
              <div
                key={i}
                className={`min-h-[110px] p-2.5 border-r border-b border-zinc-800/40 transition-colors group relative
                  ${!dia ? "opacity-20 pointer-events-none" : "hover:bg-zinc-900/20"}
                  ${hoje ? "bg-white/[0.03] border-l border-l-white/20" : ""}
                  ${prazoProximo && !hoje ? "bg-amber-500/[0.03]" : ""}
                `}
              >
                {/* Número do dia */}
                {dia && (
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-xs font-mono transition-colors ${
                      hoje
                        ? "text-white font-bold border-b border-white pb-0.5"
                        : "text-zinc-600 group-hover:text-zinc-400"
                    }`}>
                      {String(dia).padStart(2, "0")}
                    </span>
                    {prazoProximo && !hoje && (
                      <span className="w-1 h-1 rounded-full bg-amber-400" />
                    )}
                    {hoje && (
                      <span className="w-1 h-1 rounded-full bg-white" />
                    )}
                  </div>
                )}

                {/* Eventos */}
                <div className="space-y-1">
                  {eventos.map((p) => (
                    <Link
                      key={p.id}
                      href={`/projetos/${p.id}`}
                      className={`block text-[9px] font-medium px-1.5 py-1 rounded-md truncate transition-all hover:opacity-80 ${
                        p.status === "Finalizado"
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                          : isPrazoProximo(dia!)
                          ? "bg-amber-500/15 text-amber-300 border border-amber-500/20"
                          : "bg-zinc-700/50 text-zinc-200 border border-zinc-700/50"
                      }`}
                    >
                      {p.nome}
                    </Link>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Legenda */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded bg-zinc-700/50 border border-zinc-700/50" />
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Pendente</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded bg-emerald-500/15 border border-emerald-500/20" />
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Finalizado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded bg-amber-500/15 border border-amber-500/20" />
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Prazo próximo</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-white border-b border-white pb-0.5">14</span>
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Hoje</span>
        </div>
      </div>

    </div>
  )
}