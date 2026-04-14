"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  FolderKanban,
  CalendarDays,
  Package,
  Hammer,
} from "lucide-react"

const links = [
  { href: "/",           label: "Dashboard",  icon: LayoutDashboard },
  { href: "/projetos",   label: "Projetos",   icon: FolderKanban },
  { href: "/calendario", label: "Calendário", icon: CalendarDays },
  { href: "/estoque",    label: "Estoque",    icon: Package },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 bg-black border-r border-zinc-800/60 flex flex-col p-4 shrink-0">

      {/* Logo */}
      <div className="mb-8 px-2 pt-2">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-white rounded-md flex items-center justify-center flex-shrink-0">
            <Hammer size={14} className="text-black" />
          </div>
          <h1 className="text-base font-bold tracking-tighter uppercase">
            Madeirite<span className="text-zinc-600">App</span>
          </h1>
        </div>
        <div className="h-px w-full bg-gradient-to-r from-zinc-800 via-zinc-700/50 to-transparent mt-4" />
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-0.5">
        <p className="text-[9px] font-mono text-zinc-600 uppercase tracking-[0.2em] px-3 mb-2">
          Menu
        </p>
        {links.map(({ href, label, icon: Icon }) => {
          const ativo = href === "/" ? pathname === "/" : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`group flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                ativo
                  ? "bg-white text-black"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900/60 border border-transparent hover:border-zinc-800/60"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  size={15}
                  className={ativo ? "text-black" : "text-zinc-500 group-hover:text-white transition-colors"}
                />
                {label}
              </div>
              {ativo && (
                <span className="text-[10px] font-mono text-zinc-500">//</span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="mt-auto pt-4 border-t border-zinc-900/50">
        <div className="px-2 flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
            <Hammer size={10} className="text-zinc-500" />
          </div>
          <div>
            <p className="text-[10px] font-medium text-zinc-400">Marceneiro</p>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="w-1 h-1 rounded-full bg-emerald-500" />
              <p className="text-[9px] font-mono text-zinc-600">online</p>
            </div>
          </div>
        </div>
      </div>

    </aside>
  )
}