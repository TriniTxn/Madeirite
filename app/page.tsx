export default function Dashboard() {
  return (
    <div className="space-y-10">
      {/* Header da Página */}
      <header>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-mono text-zinc-600 bg-zinc-900 px-1.5 py-0.5 rounded">
            OVERVIEW
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tighter text-white">
          Dashboard
        </h1>
        <p className="text-zinc-500 text-sm">
          Bem-vindo ao terminal de gestão <span className="text-zinc-300 font-medium">MadeiriteAPP</span>.
        </p>
      </header>

      {/* Grid de Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Projetos em andamento" value="12" />
        <StatCard label="Entregas essa semana" value="04" />
        <StatCard label="Itens em estoque baixo" value="08" color="text-amber-500" />
      </div>

      {/* Placeholder para Projetos Recentes */}
      <div className="border border-zinc-800 bg-zinc-900/20 rounded-sm p-8 flex flex-col items-center justify-center min-h-[200px] border-dashed">
        <p className="text-zinc-600 font-mono text-sm tracking-widest uppercase">
          Nenhum projeto recente detectado
        </p>
      </div>
    </div>
  );
}

// Sub-componente de Card
function StatCard({ label, value, color = "text-white" }: { label: string, value: string, color?: string }) {
  return (
    <div className="group relative bg-zinc-900/40 backdrop-blur-sm border border-zinc-800 p-6 rounded-2xl transition-all duration-300 hover:border-zinc-600 hover:bg-zinc-900/60 hover:translate-y-[-2px]">
      
      {/* Glow sutil de fundo no hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
      
      <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em] mb-4 relative z-10">
        {label}
      </p>
      
      <div className="flex items-end justify-between relative z-10">
        <p className={`text-4xl font-bold tracking-tighter ${color}`}>
          {value}
        </p>
      
        <div className="w-8 h-8 rounded-full bg-zinc-800/50 flex items-center justify-center border border-zinc-700 group-hover:border-zinc-500 transition-colors">
          <div className="w-1.5 h-1.5 rounded-full bg-zinc-500 group-hover:bg-white animate-pulse" />
        </div>
      </div>
    </div>
  );
}