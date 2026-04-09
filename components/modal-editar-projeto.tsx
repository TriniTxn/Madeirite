"use client"

import { useState } from "react"
import { Pencil, Trash2 } from "lucide-react"
import { editarProjeto, arquivarProjeto } from "@/app/projetos/[id]/actions"

type Props = {
  projeto: {
    id: number
    nome: string
    status: string
    dataEntrega: Date
    cliente: { nome: string; telefone: string | null }
  }
}

export function ModalEditarProjeto({ projeto }: Props) {
  const [aberto, setAberto] = useState(false)
  const [confirmandoArquivar, setConfirmandoArquivar] = useState(false)

  const dataFormatada = new Date(projeto.dataEntrega)
    .toISOString()
    .split("T")[0]

  return (
    <>
      {/* Botão que abre o modal */}
      <button
        onClick={() => setAberto(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-xs text-zinc-400 border border-zinc-800 rounded-lg hover:border-zinc-600 hover:text-white transition-all"
      >
        <Pencil size={12} /> Editar
      </button>

      {/* Modal */}
      {aberto && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          onClick={() => setAberto(false)}
        >
          <div
            className="bg-[#111] border border-white/10 rounded-2xl p-8 w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-white">Editar Projeto</h2>
              <button
                onClick={() => setAberto(false)}
                className="text-zinc-400 hover:text-white text-xl"
              >
                ✕
              </button>
            </div>

            <form action={async (formData) => {
              await editarProjeto(formData)
              setAberto(false)
            }} className="flex flex-col gap-4">
              <input type="hidden" name="projetoId" value={projeto.id} />

              <div>
                <label className="text-xs text-zinc-400 uppercase tracking-widest mb-1 block">
                  Nome do Projeto
                </label>
                <input
                  name="nome"
                  required
                  defaultValue={projeto.nome}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white/30"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 uppercase tracking-widest mb-1 block">
                  Nome do Cliente
                </label>
                <input
                  name="clienteNome"
                  required
                  defaultValue={projeto.cliente.nome}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white/30"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 uppercase tracking-widest mb-1 block">
                  Telefone do Cliente
                </label>
                <input
                  name="clienteTelefone"
                  defaultValue={projeto.cliente.telefone || ""}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white/30"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 uppercase tracking-widest mb-1 block">
                  Data de Entrega
                </label>
                <input
                  name="dataEntrega"
                  type="date"
                  required
                  defaultValue={dataFormatada}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white/30"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 uppercase tracking-widest mb-1 block">
                  Status
                </label>
                <select
                  name="status"
                  defaultValue={projeto.status}
                  className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white/30"
                >
                  <option>Em Produção</option>
                  <option>Aguardando Material</option>
                  <option>Finalizado</option>
                </select>
              </div>

              <button
                type="submit"
                className="mt-2 bg-white text-black py-2.5 rounded-lg text-sm font-medium hover:bg-zinc-100 transition-colors"
              >
                Salvar Alterações
              </button>
            </form>

            {/* Zona de perigo — arquivar */}
            <div className="mt-6 pt-6 border-t border-zinc-800">
              {!confirmandoArquivar ? (
                <button
                  onClick={() => setConfirmandoArquivar(true)}
                  className="flex items-center gap-2 text-xs text-red-500/70 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={12} /> Arquivar projeto
                </button>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-xs text-red-400">Tem certeza?</p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setConfirmandoArquivar(false)}
                      className="text-xs text-zinc-500 hover:text-white transition-colors"
                    >
                      Cancelar
                    </button>
                    <form action={async (formData) => {
                      await arquivarProjeto(formData)
                      window.location.href = "/projetos"
                    }}>
                      <input type="hidden" name="projetoId" value={projeto.id} />
                      <button
                        type="submit"
                        className="text-xs text-red-400 hover:text-red-300 font-medium transition-colors"
                      >
                        Confirmar arquivamento
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}