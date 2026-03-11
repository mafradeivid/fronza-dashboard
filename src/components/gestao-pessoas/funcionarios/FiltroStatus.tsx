// ============================================
// FILTRO DE STATUS - FUNCIONÁRIOS
// ============================================

import { StatusFuncionario } from '@/types/pessoas'

type FiltroStatusValue = StatusFuncionario | 'todos'

interface ContagemStatus {
  ativos: number
  inativos: number
  afastados: number
}

interface FiltroStatusProps {
  filtroStatus: FiltroStatusValue
  setFiltroStatus: (status: FiltroStatusValue) => void
  contagemPorStatus: ContagemStatus
}

const OPCOES_STATUS: { value: FiltroStatusValue; label: string }[] = [
  { value: 'ativo', label: 'Ativos' },
  { value: 'inativo', label: 'Inativos' },
  { value: 'afastado', label: 'Afastados' },
  { value: 'todos', label: 'Todos' },
]

export function FiltroStatus({
  filtroStatus,
  setFiltroStatus,
  contagemPorStatus,
}: FiltroStatusProps) {
  return (
    <div className="flex gap-2 mb-4">
      {OPCOES_STATUS.map((opcao) => (
        <button
          key={opcao.value}
          onClick={() => setFiltroStatus(opcao.value)}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            filtroStatus === opcao.value
              ? 'bg-violet-600 text-white'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          {opcao.label}
          {opcao.value === 'ativo' && ` (${contagemPorStatus.ativos})`}
          {opcao.value === 'inativo' && ` (${contagemPorStatus.inativos})`}
          {opcao.value === 'afastado' && ` (${contagemPorStatus.afastados})`}
        </button>
      ))}
    </div>
  )
}