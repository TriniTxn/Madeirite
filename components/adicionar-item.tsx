"use client"

import { useTransition, useRef } from "react"
import { adicionarItem } from "@/app/projetos/[id]/actions"

type Item = {
  id: number
  titulo: string
  feito: boolean
  ordem: number
}

type Props = {
  projetoId: number
  onAdicionado: (item: Item) => void
  onIdRealizado: (idTemp: number, idReal: number) => void  // ← novo
}

export function AdicionarItem({ projetoId, onAdicionado, onIdRealizado }: Props) {
  const [isPending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const titulo = inputRef.current?.value?.trim()
    if (!titulo) return

    const idTemp = Date.now()
    onAdicionado({ id: idTemp, titulo, feito: false, ordem: 9999 })

    if (inputRef.current) inputRef.current.value = ""

    startTransition(async () => {
      const formData = new FormData()
      formData.append("projetoId", String(projetoId))
      formData.append("titulo", titulo)
      const idReal = await adicionarItem(formData)
      if (idReal) onIdRealizado(idTemp, idReal)  // ← substitui ID temp pelo real
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        ref={inputRef}
        name="titulo"
        required
        disabled={isPending}
        placeholder="Nova task... ex: Cortar MDF"
        className="flex-1 bg-zinc-900/20 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-zinc-600 outline-none transition-all disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={isPending}
        className="px-4 py-2.5 bg-white text-black text-xs font-bold rounded-xl hover:bg-zinc-200 transition-all active:scale-95 disabled:opacity-50"
      >
        + Add
      </button>
    </form>
  )
}