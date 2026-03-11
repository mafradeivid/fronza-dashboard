"use client"

import { Sidebar } from "@/components/layout/Sidebar"
import { useState } from "react"
import { Menu } from "lucide-react"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {

  const [menuOpen, setMenuOpen] = useState(false)

  return (

    <div className="flex">

      {/* Sidebar */}

      <Sidebar
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
      />

      {/* Conteúdo */}

      <main className="flex-1 md:ml-64 min-h-screen bg-slate-100">

        {/* Header Mobile */}

        <div className="md:hidden p-4 border-b bg-white flex items-center">

          <button
            onClick={() => setMenuOpen(true)}
            className="text-slate-700"
          >
            <Menu size={24} />
          </button>

          <span className="ml-3 font-semibold text-slate-700">
            Top Haus
          </span>

        </div>

        <div className="p-4">
          {children}
        </div>

      </main>

    </div>

  )
}