// ============================================
// COMPONENTE: FILTROS PROGRAMAÇÃO
// ============================================

import { Filter, Search } from 'lucide-react'
import { FiltrosProgramacao, SituacaoPeriodo } from '@/types/ferias'
import type { Empresa } from '@/types/empresa'

interface FiltrosProgramacaoBarraProps {
  filtros: FiltrosProgramacao
  empresas: Empresa[]
  onFiltroChange: <K extends keyof FiltrosProgramacao>(campo: K, valor: FiltrosProgramacao[K]) => void
}

export function FiltrosProgramacaoBarra({ filtros, empresas, onFiltroChange }: FiltrosProgramacaoBarraProps) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 mb-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-slate-500">
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">Filtros:</span>
        </div>

        <select
          value={filtros.empresa_id || ''}
          onChange={(e) => onFiltroChange('empresa_id', e.target.value ? Number(e.target.value) : undefined)}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
        >
          <option value="">Todas empresas</option>
          {empresas
            .filter((e) => e.id !== undefined)
            .map((empresa) => (
              <option key={empresa.id} value={empresa.id}>
                {empresa.razao_social}
              </option>
            ))}
        </select>

        <select
          value={filtros.situacao || 'todos'}
          onChange={(e) => onFiltroChange('situacao', e.target.value as SituacaoPeriodo | 'todos')}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
        >
          <option value="todos">Todas situações</option>
          <option value="vencido">Vencidos</option>
          <option value="critico">Críticos</option>
          <option value="atencao">Atenção</option>
          <option value="normal">Normal</option>
          <option value="em_aquisicao">Em aquisição</option>
        </select>

        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar funcionário..."
            value={filtros.busca || ''}
            onChange={(e) => onFiltroChange('busca', e.target.value || undefined)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
          />
        </div>
      </div>
    </div>
  )
}
