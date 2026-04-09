"use client"

import { useState, useEffect, useTransition } from "react"
import { Clock } from "lucide-react"
import { updateAnotacoes } from "@/app/projetos/[id]/actions"

type Props = {
  projetoId: number
  valorInicial: string | null
}

export function AnotacoesAutoSave({ projetoId, valorInicial }: Props) {
  const [texto, setTexto] = useState(valorInicial || "")
  const [status, setStatus] = useState<"idle" | "salvando" | "salvo">("idle")
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (texto === (valorInicial || "")) return

    setStatus("salvando")

    const timer = setTimeout(() => {
      startTransition(async () => {
        const formData = new FormData()
        formData.append("projetoId", String(projetoId))
        formData.append("anotacoes", texto)
        await updateAnotacoes(formData)
        setStatus("salvo")

        setTimeout(() => setStatus("idle"), 2000)
      })
    }, 1000) // salva 1 segundo depois de parar de digitar

    return () => clearTimeout(timer)
  }, [texto])

  return (
    <div className="bg-zinc-900/20 border border-zinc-800 rounded-3xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-2">
          <Clock size={14} /> Log de Notas
        </h3>
        <span className={`text-[10px] font-mono transition-opacity duration-300 ${
          status === "idle" ? "opacity-0" : "opacity-100"
        } ${
          status === "salvando" ? "text-zinc-500" : "text-emerald-500"
        }`}>
          {status === "salvando" ? "salvando..." : "salvo"}
        </span>
      </div>

      <textarea
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        className="w-full h-56 bg-zinc-950/50 border border-zinc-800 rounded-2xl p-4 text-sm text-zinc-300 focus:border-zinc-600 outline-none transition-all resize-none leading-relaxed"
        placeholder="Detalhes técnicos, ferragens, ou alterações de última hora..."
      />
    </div>
  )
}