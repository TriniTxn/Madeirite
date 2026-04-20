import { prisma } from "@/lib/db"
import { Package, AlertTriangle, TrendingDown } from "lucide-react"
import { ModalNovoMaterial } from "@/components/modal-novo-material"
import { ModalEditarMaterial } from "@/components/modal-editar-material"
import { removerMaterial } from "./actions"

export default async function EstoquePage() {
  const materiais = await prisma.material.findMany({
    orderBy: { nome: "asc" }
  })
  type Material = typeof materiais[number]

  const itensAbaixoDoMinimo = materiais.filter((m: Material) => m.quantidade <= m.minimo && m.quantidade > 0)
  const itensCriticos = materiais.filter((m: Material) => m.quantidade === 0)
  const itensOk = materiais.filter((m: Material) => m.quantidade > m.minimo)

  function getStatus(m: { quantidade: number; minimo: number }) {
    if (m.quantidade === 0) return "CRÍTICO"
    if (m.quantidade <= m.minimo) return "BAIXO"
    return "OK"
  }

  function getPorcentagem(quantidade: number, minimo: number) {
    if (minimo === 0) return 100
    return Math.min(Math.round((quantidade / (minimo * 2)) * 100), 100)
  }

  return (
    <div className="space-y-8">

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-800/50 pb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-mono text-zinc-600 bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded">
              INVENTÁRIO
            </span>
          </div>
          <h1 className="text-4xl font-bold tracking-tighter text-white">Estoque</h1>
          <p className="text-zinc-500 text-sm mt-1">Controle de insumos e matérias-primas.</p>
        </div>

        <div className="flex items-center gap-3">
          {itensCriticos.length > 0 && (
            <div className="flex items-center gap-2.5 bg-red-500/5 border border-red-500/20 px-4 py-2.5 rounded-xl">
              <AlertTriangle className="text-red-400" size={14} />
              <div>
                <p className="text-[9px] font-mono text-red-400/60 uppercase tracking-widest">Crítico</p>
                <p className="text-sm font-bold text-red-400">{itensCriticos.length} zerados</p>
              </div>
            </div>
          )}
          {itensAbaixoDoMinimo.length > 0 && (
            <div className="flex items-center gap-2.5 bg-amber-500/5 border border-amber-500/20 px-4 py-2.5 rounded-xl">
              <TrendingDown className="text-amber-400" size={14} />
              <div>
                <p className="text-[9px] font-mono text-amber-400/60 uppercase tracking-widest">Baixo</p>
                <p className="text-sm font-bold text-amber-400">{itensAbaixoDoMinimo.length} itens</p>
              </div>
            </div>
          )}
          <ModalNovoMaterial />
        </div>
      </header>

      {/* Resumo rápido */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Package size={14} className="text-emerald-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{itensOk.length}</p>
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Em estoque</p>
          </div>
        </div>
        <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <TrendingDown size={14} className="text-amber-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-amber-400">{itensAbaixoDoMinimo.length}</p>
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Abaixo do mínimo</p>
          </div>
        </div>
        <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <AlertTriangle size={14} className="text-red-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-red-400">{itensCriticos.length}</p>
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Zerados</p>
          </div>
        </div>
      </div>

      {/* Tabela */}
      {materiais.length === 0 ? (
        <div className="border border-dashed border-zinc-800 rounded-2xl p-20 text-center">
          <Package size={32} className="text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-600 text-xs uppercase tracking-widest">
            Nenhum material cadastrado
          </p>
        </div>
      ) : (
        <div className="border border-zinc-800/60 rounded-2xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800/60 bg-zinc-900/20">
                <th className="px-6 py-4 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Item</th>
                <th className="px-6 py-4 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Categoria</th>
                <th className="px-6 py-4 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Nível</th>
                <th className="px-6 py-4 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Qtd. atual</th>
                <th className="px-6 py-4 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Mínimo</th>
                <th className="px-6 py-4 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/30">
              {materiais.map((m: Material) => {
                const status = getStatus(m)
                const pct = getPorcentagem(m.quantidade, m.minimo)
                return (
                  <tr key={m.id} className="group hover:bg-zinc-900/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all ${
                          status === "CRÍTICO" ? "bg-red-500/10 border-red-500/20 text-red-400" :
                          status === "BAIXO"   ? "bg-amber-500/10 border-amber-500/20 text-amber-400" :
                          "bg-zinc-900 border-zinc-800 text-zinc-500 group-hover:border-zinc-700 group-hover:text-white"
                        }`}>
                          <Package size={14} />
                        </div>
                        <span className="text-sm font-medium text-zinc-200 group-hover:text-white transition-colors">
                          {m.nome}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-zinc-500 bg-zinc-900/50 px-2 py-0.5 rounded border border-zinc-800/50">
                        {m.categoria}
                      </span>
                    </td>
                    <td className="px-6 py-4 w-36">
                      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            status === "CRÍTICO" ? "bg-red-500" :
                            status === "BAIXO"   ? "bg-amber-500" :
                            "bg-emerald-500"
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-mono font-bold ${
                        status === "CRÍTICO" ? "text-red-400" :
                        status === "BAIXO"   ? "text-amber-400" :
                        "text-zinc-200"
                      }`}>
                        {m.quantidade} <span className="text-zinc-600 font-normal">{m.unidade}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono text-zinc-600">
                        {m.minimo} <span className="text-zinc-700">{m.unidade}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        status === "OK"      ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-500" :
                        status === "BAIXO"   ? "bg-amber-500/5 border-amber-500/20 text-amber-500" :
                        "bg-red-500/5 border-red-500/20 text-red-500"
                      }`}>
                        <span className={`w-1 h-1 rounded-full animate-pulse ${
                          status === "OK"    ? "bg-emerald-500" :
                          status === "BAIXO" ? "bg-amber-500" : "bg-red-500"
                        }`} />
                        {status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ModalEditarMaterial material={{
                          id: m.id, nome: m.nome, categoria: m.categoria,
                          unidade: m.unidade, quantidade: m.quantidade, minimo: m.minimo,
                        }} />
                        <form action={removerMaterial} className="inline">
                          <input type="hidden" name="id" value={m.id} />
                          <button type="submit" className="p-2 text-zinc-600 hover:text-red-400 transition-colors" title="Remover">
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
      )}

      {/* Banner crítico */}
      {itensCriticos.length > 0 && (
        <div className="flex items-start gap-4 border border-red-500/20 bg-red-500/5 rounded-2xl p-5">
          <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={14} className="text-red-400" />
          </div>
          <div>
            <p className="text-xs font-bold text-red-400 uppercase tracking-widest mb-1.5">
              Reposição urgente necessária
            </p>
            <div className="flex flex-wrap gap-2">
              {itensCriticos.map((m: Material) => (
                <span key={m.id} className="text-[10px] font-mono bg-red-500/10 border border-red-500/20 text-red-300/70 px-2 py-0.5 rounded">
                  {m.nome}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}