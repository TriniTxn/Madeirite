import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "MadeiraApp",
  description: "Gestão de marcenaria",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="flex h-screen bg-background text-foreground antialiased">

        {/* Sidebar */}
        <aside className="w-64 bg-black border-r border-zinc-800 flex flex-col p-6 gap-2">
          
          {/* Logo / Header da Sidebar */}
          <div className="mb-10 px-2">
            <h1 className="text-xl font-bold tracking-tighter uppercase">
              Madeirite<span className="text-zinc-500">App</span>
            </h1>
            <div className="h-[1px] w-full bg-gradient-to-r from-zinc-800 to-transparent mt-2" />
          </div>

          {/* Navegação */}
          <nav className="flex flex-col gap-1">
            <SidebarLink href="/">Dashboard</SidebarLink>
            <SidebarLink href="/projetos">Projetos</SidebarLink>
            <SidebarLink href="/calendario">Calendário</SidebarLink>
            <SidebarLink href="/estoque">Estoque</SidebarLink>
          </nav>

          {/* Rodapé da Sidebar */}
          <div className="mt-auto pt-6 border-t border-zinc-900">
            <div className="flex items-center gap-2 px-2 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              Sistema Online
            </div>
          </div>
        </aside>

        {/* Conteúdo principal com grid de fundo sutil */}
        <main className="relative flex-1 overflow-y-auto bg-[#050505]">
          <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
          
          <div className="relative z-10 p-10">
            {children}
          </div>
        </main>

      </body>
    </html>
  );
}

// Sub-componente para manter o código limpo e estilizado
function SidebarLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link 
      href={href} 
      className="group flex items-center justify-between px-3 py-2 text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-900/50 rounded-md transition-all duration-200 border border-transparent hover:border-zinc-800"
    >
      {children}
      <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-mono text-zinc-600">
        //
      </span>
    </Link>
  );
}