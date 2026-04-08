import { Package, AlertTriangle, ArrowUpRight, Search, Plus } from "lucide-react";

export default function EstoquePage() {
  return (
    <div className="space-y-8">
      {/* Header com Resumo de Alertas */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tighter text-white">Estoque</h1>
          <p className="text-zinc-500 text-sm mt-1">Controle de insumos e matérias-primas.</p>
        </div>

        <div className="flex gap-4">
          <div className="bg-zinc-900/50 border border-zinc-800 px-4 py-2 rounded-2xl flex items-center gap-3">
            <AlertTriangle className="text-amber-500" size={18} />
            <div>
              <p className="text-[10px] font-mono text-zinc-500 uppercase">Alertas</p>
              <p className="text-sm font-bold text-white">3 Itens Baixos</p>
            </div>
          </div>
          <button className="bg-white text-black px-4 py-2 rounded-xl font-semibold text-sm hover:bg-zinc-200 transition-all flex items-center gap-2">
            <Plus size={18} />
            Adicionar Item
          </button>
        </div>
      </div>

      {/* Tabela de Itens */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/30">
                <th className="px-6 py-4 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Item</th>
                <th className="px-6 py-4 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Categoria</th>
                <th className="px-6 py-4 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Qtd. Atual</th>
                <th className="px-6 py-4 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              <StockRow 
                nome="MDF Louro Freijó 18mm" 
                categoria="Chapas" 
                qtd="14 un" 
                status="OK" 
              />
              <StockRow 
                nome="Corrediça Telescópica 45cm" 
                categoria="Ferragens" 
                qtd="03 un" 
                status="BAIXO" 
              />
              <StockRow 
                nome="Cola de Contato 1L" 
                categoria="Químicos" 
                qtd="08 un" 
                status="OK" 
              />
              <StockRow 
                nome="Dobradiça Click 35mm" 
                categoria="Ferragens" 
                qtd="00 un" 
                status="CRÍTICO" 
              />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StockRow({ nome, categoria, qtd, status }: any) {
  const isLow = status === "BAIXO" || status === "CRÍTICO";
  
  return (
    <tr className="group hover:bg-zinc-900/40 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 group-hover:text-white group-hover:border-zinc-700 transition-all">
            <Package size={16} />
          </div>
          <span className="text-sm font-medium text-zinc-200">{nome}</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className="text-xs text-zinc-500">{categoria}</span>
      </td>
      <td className="px-6 py-4">
        <span className="text-sm font-mono text-zinc-300">{qtd}</span>
      </td>
      <td className="px-6 py-4">
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
          status === "OK" ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-500" :
          status === "BAIXO" ? "bg-amber-500/5 border-amber-500/20 text-amber-500" :
          "bg-red-500/5 border-red-500/20 text-red-500"
        }`}>
          <span className={`w-1 h-1 rounded-full animate-pulse ${
            status === "OK" ? "bg-emerald-500" :
            status === "BAIXO" ? "bg-amber-500" :
            "bg-red-500"
          }`} />
          {status}
        </span>
      </td>
      <td className="px-6 py-4 text-right">
        <button className="p-2 text-zinc-600 hover:text-white transition-colors">
          <ArrowUpRight size={18} />
        </button>
      </td>
    </tr>
  );
}