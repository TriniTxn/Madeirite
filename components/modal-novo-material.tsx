"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { adicionarMaterial } from "@/app/estoque/actions"

export function ModalNovoMaterial() {
  const [aberto, setAberto] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    try {
      const formData = new FormData(e.currentTarget)
      await adicionarMaterial(formData)
      setAberto(false)
      ;(e.target as HTMLFormElement).reset()
    } catch (error) {
        console.error("Erro no modal:", error)
        alert("Erro ao salvar material.")
    } finally {
    setLoading(false)
    }
  }

  if (!aberto) {
    return (
      <button
        onClick={() => setAberto(true)}
        className="bg-white text-black px-4 py-2 rounded-xl font-semibold text-sm hover:bg-zinc-200 transition-all flex items-center gap-2"
      >
        <Plus size={18} /> Adicionar Item
      </button>
    )
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
      onClick={() => setAberto(false)}
    >
      <div
        className="bg-[#111] border border-white/10 rounded-2xl p-8 w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-white">Novo Material</h2>
          <button onClick={() => setAberto(false)} className="text-zinc-400 hover:text-white text-xl">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs text-zinc-400 uppercase tracking-widest mb-1 block">Nome</label>
            <input
              name="nome"
              required
              placeholder="Ex: MDF Louro Freijó 18mm"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-white/30"
            />
          </div>

          <div>
            <label className="text-xs text-zinc-400 uppercase tracking-widest mb-1 block">Categoria</label>
            <select
              name="categoria"
              className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white/30"
            >
              <option>Chapas</option>
              <option>Ferragens</option>
              <option>Químicos</option>
              <option>Fixadores</option>
              <option>Acabamento</option>
              <option>Geral</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-zinc-400 uppercase tracking-widest mb-1 block">Quantidade atual</label>
              <input
                name="quantidade"
                type="number"
                min="0"
                step="0.01"
                required
                placeholder="0"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-white/30"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-400 uppercase tracking-widest mb-1 block">Mínimo (alerta)</label>
              <input
                name="minimo"
                type="number"
                min="0"
                step="0.01"
                required
                placeholder="0"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-white/30"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-zinc-400 uppercase tracking-widest mb-1 block">Unidade</label>
            <select
              name="unidade"
              className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white/30"
            >
              <option value="un">Unidades (un)</option>
              <option value="kg">Quilogramas (kg)</option>
              <option value="m">Metros (m)</option>
              <option value="m²">Metro quadrado (m²)</option>
              <option value="L">Litros (L)</option>
              <option value="cx">Caixas (cx)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 bg-white text-black py-2.5 rounded-lg text-sm font-medium hover:bg-zinc-100 transition-colors disabled:opacity-50"
          >
            {loading ? "Salvando..." : "Adicionar Material"}
          </button>
        </form>
      </div>
    </div>
  )
}