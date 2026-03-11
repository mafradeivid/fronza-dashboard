// ============================================
// BARRA DE FILTROS - FUNCIONÁRIOS
// ============================================

import { useState } from 'react'
import { Search, Filter, X } from 'lucide-react'
import { Empresa, Setor, Cargo } from '@/types/pessoas'

interface BarraFiltrosProps {
  filtroBusca: string
  setFiltroBusca: (busca: string) => void
  filtroEmpresa: number | null
  setFiltroEmpresa: (id: number | null) => void
  filtroSetor: string | null
  setFiltroSetor: (id: string | null) => void
  filtroCargo: number | null
  setFiltroCargo: (id: number | null) => void
  limparFiltros: () => void
  empresas: Empresa[]
  setores: Setor[]
  cargos: Cargo[]
}

export function BarraFiltros({
  filtroBusca,
  setFiltroBusca,
  filtroEmpresa,
  setFiltroEmpresa,
  filtroSetor,
  setFiltroSetor,
  filtroCargo,
  setFiltroCargo,
  limparFiltros,
  empresas,
  setores,
  cargos,
}: BarraFiltrosProps) {
  const [mostrarFiltros, setMostrarFiltros] = useState(false)

  const temFiltrosAtivos = filtroEmpresa || filtroSetor || filtroCargo || filtroBusca

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-4 mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Busca */}
        <div className="flex-1 relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filtroBusca}
            onChange={(e) => setFiltroBusca(e.target.value)}
            placeholder="Buscar por nome ou matrícula..."
            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none"
          />
        </div>

        {/* Botão Filtros */}
        <button
          onClick={() => setMostrarFiltros(!mostrarFiltros)}
          className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl transition-colors ${
            temFiltrosAtivos 
              ? 'border-violet-500 bg-violet-50 text-violet-700' 
              : 'border-slate-300 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Filter className="w-4 h-4" />
          Filtros
          {temFiltrosAtivos && (
            <span className="bg-violet-500 text-white text-xs px-2 py-0.5 rounded-full">
              {[filtroEmpresa, filtroSetor, filtroCargo].filter(Boolean).length}
            </span>
          )}
        </button>

        {/* Limpar Filtros */}
        {temFiltrosAtivos && (
          <button
            onClick={limparFiltros}
            className="flex items-center gap-2 px-4 py-2.5 text-slate-500 hover:text-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
            Limpar
          </button>
        )}
      </div>

      {/* Filtros Expandidos */}
      {mostrarFiltros && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-200">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Empresa</label>
            <select
              value={filtroEmpresa || ''}
              onChange={(e) => setFiltroEmpresa(e.target.value ? Number(e.target.value) : null)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none bg-white"
            >
              <option value="">Todas</option>
              {empresas.map((e) => (
                <option key={e.id} value={e.id}>{e.razao_social}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Setor</label>
            <select
              value={filtroSetor || ''}
              onChange={(e) => setFiltroSetor(e.target.value || null)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none bg-white"
            >
              <option value="">Todos</option>
              {setores.map((s) => (
                <option key={s.id} value={s.id}>{s.nome}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Cargo</label>
            <select
              value={filtroCargo || ''}
              onChange={(e) => setFiltroCargo(e.target.value ? Number(e.target.value) : null)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none bg-white"
            >
              <option value="">Todos</option>
              {cargos.map((c) => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  )
}