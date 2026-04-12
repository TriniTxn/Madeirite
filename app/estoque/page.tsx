import { prisma } from "@/lib/db"
import { Package, AlertTriangle } from "lucide-react"
import { ModalNovoMaterial } from "@/components/modal-novo-material"
import { ModalEditarMaterial } from "@/components/modal-editar-material"
import { removerMaterial } from "./actions"

export default async function EstoquePage() {
  const materiais = await prisma.material.findMany({
    orderBy: { nome: "asc" }
  })

  const itensAbaixoDoMinimo = materiais.filter(m => m.quantidade <= m.minimo)
  const itensCriticos = materiais.filter(m => m.quantidade === 0)

  function getStatus(m: { quantidade: number; minimo: number }) {
    if (m.quantidade === 0) return "CRÍTICO"
    if (m.quantidade <= m.minimo) return "BAIXO"
    return "OK"
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tighter text-white">Estoque</h1>
          <p className="text-zinc-500 text-sm mt-1">Controle de insumos e matérias-primas.</p>
        </div>

        <div className="flex gap-4">
          {itensAbaixoDoMinimo.length > 0 && (
            <div className="bg-zinc-900/50 border border-amber-500/20 px-4 py-2 rounded-2xl flex items-center gap-3">
              <AlertTriangle className="text-amber-500" size={18} />
              <div>
                <p className="text-[10px] font-mono text-zinc-500 uppercase">Alertas</p>
                <p className="text-sm font-bold text-white">
                  {itensAbaixoDoMinimo.length} {itensAbaixoDoMinimo.length === 1 ? "Item Baixo" : "Itens Baixos"}
                </p>
              </div>
            </div>
          )}
          <ModalNovoMaterial />
        </div>
      </div>

      {/* Tabela */}
      {materiais.length === 0 ? (
        <div className="border border-dashed border-zinc-800 rounded-2xl p-20 text-center">
          <p className="text-zinc-600 text-xs uppercase tracking-widest">
            Nenhum material cadastrado
          </p>
        </div>
      ) : (
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/30">
                  <th className="px-6 py-4 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Item</th>
                  <th className="px-6 py-4 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Categoria</th>
                  <th className="px-6 py-4 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Qtd. Atual</th>
                  <th className="px-6 py-4 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Mínimo</th>
                  <th className="px-6 py-4 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {materiais.map((m) => {
                  const status = getStatus(m)
                  return (
                    <tr key={m.id} className="group hover:bg-zinc-900/40 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 group-hover:text-white group-hover:border-zinc-700 transition-all">
                            <Package size={16} />
                          </div>
                          <span className="text-sm font-medium text-zinc-200">{m.nome}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-zinc-500">{m.categoria}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-mono text-zinc-300">
                          {m.quantidade} {m.unidade}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-mono text-zinc-500">
                          {m.minimo} {m.unidade}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          status === "OK"
                            ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-500"
                            : status === "BAIXO"
                            ? "bg-amber-500/5 border-amber-500/20 text-amber-500"
                            : "bg-red-500/5 border-red-500/20 text-red-500"
                        }`}>
                          <span className={`w-1 h-1 rounded-full animate-pulse ${
                            status === "OK" ? "bg-emerald-500" :
                            status === "BAIXO" ? "bg-amber-500" : "bg-red-500"
                          }`} />
                          {status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <ModalEditarMaterial material={{
                            id: m.id,
                            nome: m.nome,
                            categoria: m.categoria,
                            unidade: m.unidade,
                            quantidade: m.quantidade,
                            minimo: m.minimo,
                          }} />
                          <form action={removerMaterial} className="inline">
                            <input type="hidden" name="id" value={m.id} />
                            <button
                              type="submit"
                              className="p-2 text-zinc-600 hover:text-red-400 transition-colors"
                              title="Remover"
                            >
                              ✕
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Alerta crítico */}
      {itensCriticos.length > 0 && (
        <div className="border border-red-500/20 bg-red-500/5 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-bold text-red-400 uppercase tracking-widest mb-1">
              Itens zerados — reposição urgente
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {itensCriticos.map((m) => (
                <span key={m.id} className="text-xs text-red-300/70">
                  • {m.nome}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}