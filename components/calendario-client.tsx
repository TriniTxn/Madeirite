"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Clock } from "lucide-react"
import Link from "next/link" // Importação necessária
import { formatarData } from "@/lib/utils"

type Projeto = {
  id: number
  nome: string
  dataEntrega: Date | string // Pode vir como string do Server Component
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
HOJE.setHours(0, 0, 0, 0) // Zera as horas para comparação justa

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
      return (
        d.getUTCDate() === dia &&
        d.getUTCMonth() === mes &&
        d.getUTCFullYear() === ano
      )
    })
  }

  function eHoje(dia: number) {
    return (
      dia === HOJE.getDate() &&
      mes === HOJE.getMonth() &&
      ano === HOJE.getFullYear()
    )
  }

  function isPrazoProximo(dia: number) {
    const dataAlvo = new Date(ano, mes, dia)
    const diffTime = dataAlvo.getTime() - HOJE.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays >= 0 && diffDays <= 3
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tighter text-white">Calendário</h1>
          <p className="text-zinc-500 text-sm mt-1">Cronograma de montagens e entregas.</p>
        </div>

        <div className="flex items-center gap-2 bg-zinc-900/50 border border-zinc-800 p-1 rounded-xl">
          <button onClick={mesAnterior} className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-all">
            <ChevronLeft size={20} />
          </button>
          <span className="px-4 text-sm font-mono font-medium text-zinc-200 uppercase tracking-widest min-w-[150px] text-center">
            {MESES[mes]} {ano}
          </span>
          <button onClick={proximoMes} className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-all">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="grid grid-cols-7 border-b border-zinc-900 bg-zinc-900/20">
          {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((dia) => (
            <div key={dia} className="py-3 text-center text-[10px] font-mono text-zinc-600 uppercase tracking-[0.2em]">
              {dia}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {celulas.map((dia, i) => {
            const eventos = dia ? projetosDoDia(dia) : []
            const hoje = dia ? eHoje(dia) : false
            const prazoProximo = dia ? isPrazoProximo(dia) && eventos.some(p => p.status !== "Finalizado") : false

            return (
              <div
                key={i}
                className={`min-h-[120px] p-3 border-r border-b border-zinc-900 transition-all duration-300 hover:bg-zinc-900/30 group relative
                  ${!dia ? "bg-black/40 opacity-20" : ""}
                  ${prazoProximo ? "bg-amber-500/5" : ""}
                `}
              >
                {dia && (
                  <span className={`text-xs font-mono ${hoje ? "text-white font-bold" : "text-zinc-600 group-hover:text-zinc-400"}`}>
                    {String(dia).padStart(2, "0")}
                  </span>
                )}

                {hoje && <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_#fff]" />}
                {prazoProximo && !hoje && <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]" />}

                <div className="mt-2 space-y-1">
                  {eventos.map((p) => (
                    <Link
                      key={p.id}
                      href={`/projetos/${p.id}`}
                      className={`block text-[10px] font-bold p-1.5 rounded-lg truncate transition-all hover:scale-[1.02] active:scale-95 ${
                        p.status === "Finalizado"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/10"
                          : isPrazoProximo(dia!) 
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/20"
                            : "bg-zinc-100 text-black shadow-lg shadow-black/20"
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

      {/* Alertas Próximos */}
      {projetos.some(p => {
        const d = new Date(p.dataEntrega);
        const diff = (d.getTime() - HOJE.getTime()) / (1000 * 60 * 60 * 24);
        return diff >= 0 && diff <= 3 && p.status !== "Finalizado";
      }) && (
        <div className="border border-amber-500/20 bg-amber-500/5 rounded-2xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2">
          <Clock size={16} className="text-amber-400 mt-0.5" />
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-amber-400 uppercase tracking-[0.2em]">Prazos Críticos</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {projetos.filter(p => {
                const d = new Date(p.dataEntrega);
                const diff = (d.getTime() - HOJE.getTime()) / (1000 * 60 * 60 * 24);
                return diff >= 0 && diff <= 3 && p.status !== "Finalizado";
              }).map(p => (
                <Link key={p.id} href={`/projetos/${p.id}`} className="text-xs text-amber-200/60 hover:text-amber-200 transition-colors">
                  • {p.nome} ({formatarData(p.dataEntrega)})
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}