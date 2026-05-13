"use client"

import { useState } from "react"
import { criarProjeto } from "@/lib/actions"

export function ModalNovoProjeto() {
  const [aberto, setAberto] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const form = e.currentTarget
    const data = {
      nome: (form.elements.namedItem("nome") as HTMLInputElement).value,
      clienteNome: (form.elements.namedItem("clienteNome") as HTMLInputElement).value,
      clienteTelefone: (form.elements.namedItem("clienteTelefone") as HTMLInputElement).value,
      dataEntrega: (form.elements.namedItem("dataEntrega") as HTMLInputElement).value,
      status: (form.elements.namedItem("status") as HTMLSelectElement).value,
    }

    await criarProjeto(data)
    setLoading(false)
    setAberto(false)
    form.reset()
  }

  if (!aberto) {
    return (
      <button
        onClick={() => setAberto(true)}
        className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
      >
        + Novo Projeto
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-[#111] border border-white/10 rounded-2xl p-8 w-full max-w-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-white">Novo Projeto</h2>
          <button
            onClick={() => setAberto(false)}
            className="text-gray-400 hover:text-white text-xl"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-widest mb-1 block">
              Nome do Projeto
            </label>
            <input
              name="nome"
              required
              placeholder="Ex: Cozinha Planejada Ap 402"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/30"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 uppercase tracking-widest mb-1 block">
              Nome do Cliente
            </label>
            <input
              name="clienteNome"
              required
              placeholder="Ex: Marcos Silva"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/30"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 uppercase tracking-widest mb-1 block">
              Telefone do Cliente
            </label>
            <input
              name="clienteTelefone"
              placeholder="Ex: (11) 99999-9999"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/30"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 uppercase tracking-widest mb-1 block">
              Data de Entrega
            </label>
            <input
              name="dataEntrega"
              type="date"
              required
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white/30"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 uppercase tracking-widest mb-1 block">
              Status
            </label>
            <select
              name="status"
              className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white/30"
            >
              <option>Em Produção</option>
              <option>Aguardando Material</option>
              <option>Aprovando Projeto</option>
              <option>Pré Montagem</option>
              <option>Montagem</option>
              <option>Finalizado</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 bg-white text-black py-2.5 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            {loading ? "Salvando..." : "Criar Projeto"}
          </button>
        </form>
      </div>
    </div>
  )
}