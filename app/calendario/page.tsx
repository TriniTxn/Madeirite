import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from "lucide-react";

export default function CalendarioPage() {
  // Exemplo simples de dias (isso seria gerado dinamicamente)
  const dias = Array.from({ length: 35 }, (_, i) => i - 3); 

  return (
    <div className="space-y-8">
      {/* Header do Calendário */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tighter text-white">Calendário</h1>
          <p className="text-zinc-500 text-sm mt-1">Cronograma de montagens e entregas.</p>
        </div>

        <div className="flex items-center gap-2 bg-zinc-900/50 border border-zinc-800 p-1 rounded-xl">
          <button className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-all">
            <ChevronLeft size={20} />
          </button>
          <span className="px-4 text-sm font-mono font-medium text-zinc-200 uppercase tracking-widest">
            Abril 2026
          </span>
          <button className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-all">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Grid do Calendário */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
        {/* Dias da Semana */}
        <div className="grid grid-cols-7 border-b border-zinc-900 bg-zinc-900/20">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(dia => (
            <div key={dia} className="py-3 text-center text-[10px] font-mono text-zinc-600 uppercase tracking-[0.2em]">
              {dia}
            </div>
          ))}
        </div>

        {/* Células dos Dias */}
        <div className="grid grid-cols-7">
          {dias.map((dia, i) => (
            <div 
              key={i} 
              className={`min-h-[120px] p-3 border-r border-b border-zinc-900 transition-all duration-300 hover:bg-zinc-900/30 group relative
                ${dia <= 0 || dia > 30 ? 'bg-black/40 opacity-20' : ''}`}
            >
              <span className={`text-xs font-mono ${dia === 8 ? 'text-white font-bold' : 'text-zinc-600 group-hover:text-zinc-400'}`}>
                {dia > 0 && dia <= 30 ? dia.toString().padStart(2, '0') : ''}
              </span>

              {/* Exemplo de Evento/Tarefa */}
              {dia === 8 && (
                <div className="mt-2 space-y-1">
                  <div className="bg-zinc-100 text-[10px] text-black font-bold p-1.5 rounded-lg shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                    Montagem: Cozinha Ap 402
                  </div>
                </div>
              )}

              {dia === 12 && (
                <div className="mt-2 space-y-1">
                  <div className="border border-zinc-700 text-[9px] text-zinc-400 p-1.5 rounded-lg flex items-center gap-1 uppercase tracking-tighter">
                    <Clock size={10} /> Entrega MDF
                  </div>
                </div>
              )}

              {/* Indicador de "Hoje" */}
              {dia === 8 && (
                <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_#fff]" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Legenda Tech */}
      <div className="flex gap-6 pt-4 items-center">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-white" />
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Montagem Externa</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full border border-zinc-700" />
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Logística Interna</span>
        </div>
      </div>
    </div>
  );
}