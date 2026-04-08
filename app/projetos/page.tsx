import { Plus, Filter, Search } from "lucide-react"

export default function ProjetosPage() {
  return (
    <div className="space-y-8">
      {/* Header com Ações */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tighter text-white">Projetos</h1>
          <p className="text-zinc-500 text-sm mt-1">Gerencie e acompanhe a execução dos pedidos.</p>
        </div>
        
        <button className="flex items-center justify-center gap-2 bg-white text-black px-4 py-2 rounded-xl font-semibold text-sm hover:bg-zinc-200 transition-all active:scale-95">
          <Plus size={18} />
          Novo Projeto
        </button>
      </div>

      {/* Barra de Filtros Estilo Glass */}
      <div className="flex flex-wrap items-center gap-3 p-2 bg-zinc-900/30 border border-zinc-800 rounded-2xl">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
          <input 
            type="text" 
            placeholder="Buscar projeto..." 
            className="w-full bg-transparent border-none focus:ring-0 text-sm text-zinc-300 pl-10"
          />
        </div>
        <div className="h-6 w-[1px] bg-zinc-800 hidden md:block" />
        <button className="flex items-center gap-2 px-4 py-1.5 text-xs font-medium text-zinc-400 hover:text-white transition-colors">
          <Filter size={14} />
          Filtrar por Status
        </button>
      </div>

      {/* Grid de Projetos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ProjetoCard 
          titulo="Cozinha Planejada - Ap 402" 
          cliente="Marcos Silva"
          status="Em Produção"
          progresso={65}
        />
        <ProjetoCard 
          titulo="Mesa de Jantar Rustica" 
          cliente="Ana Paula"
          status="Aguardando Material"
          progresso={15}
        />
        <ProjetoCard 
          titulo="Painel de TV Sala" 
          cliente="Roberto Junior"
          status="Finalizado"
          progresso={100}
        />
      </div>
    </div>
  );
}

// Sub-componente de Card de Projeto
function ProjetoCard({ titulo, cliente, status, progresso }: any) {
  return (
    <div className="group bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-600 transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider bg-zinc-950 px-2 py-1 rounded-md border border-zinc-800">
          ID-2024-001
        </span>
        <div className={`w-2 h-2 rounded-full ${progresso === 100 ? 'bg-emerald-500' : 'bg-amber-500'} shadow-[0_0_8px_currentColor]`} />
      </div>

      <h3 className="text-lg font-bold text-white mb-1 group-hover:text-zinc-200 transition-colors">
        {titulo}
      </h3>
      <p className="text-zinc-500 text-sm mb-6">{cliente}</p>

      {/* Barra de Progresso Customizada */}
      <div className="space-y-2">
        <div className="flex justify-between text-[10px] font-mono uppercase tracking-widest text-zinc-500">
          <span>Progresso</span>
          <span>{progresso}%</span>
        </div>
        <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-white transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(255,255,255,0.3)]" 
            style={{ width: `${progresso}%` }}
          />
        </div>
      </div>
      
      <div className="mt-6 pt-4 border-t border-zinc-800 flex justify-between items-center">
        <span className="text-xs font-medium text-zinc-400">{status}</span>
        <button className="text-xs text-white underline underline-offset-4 hover:text-zinc-300 transition-colors">
          Ver detalhes
        </button>
      </div>
    </div>
  );
}