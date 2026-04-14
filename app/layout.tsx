import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { Sidebar } from "@/components/sidebar";

export const metadata: Metadata = {
  title: "MadeiriteApp",
  description: "Gestão de marcenaria",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="flex h-screen bg-background text-foreground antialiased overflow-hidden">
        <Sidebar />

        <main className="relative flex-1 overflow-y-auto bg-[#050505]">
          <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
          <div className="relative z-10 p-10">
            {children}
          </div>
        </main>
      </body>
    </html>
  )
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