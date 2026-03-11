// ============================================
// CARDS DE RESUMO - FUNCIONÁRIOS
// ============================================

import { formatarMoeda } from '@/utils/formatters'

interface ContagemStatus {
  ativos: number
  inativos: number
  afastados: number
}

interface CardsResumoProps {
  totalFuncionarios: number
  totalSalarios: number
  totalOutrosProventos: number
  contagemPorStatus: ContagemStatus
}

export function CardsResumo({
  totalFuncionarios,
  totalSalarios,
  totalOutrosProventos,
  contagemPorStatus,
}: CardsResumoProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-gradient-to-br from-violet-500 to-violet-600 rounded-2xl p-5 text-white">
        <p className="text-violet-100 text-sm font-medium">Total de Funcionários</p>
        <p className="text-3xl font-bold mt-1">{totalFuncionarios}</p>
        <div className="flex gap-3 mt-2 text-xs text-violet-200">
          <span>{contagemPorStatus.ativos} ativos</span>
          <span>{contagemPorStatus.inativos} inativos</span>
          <span>{contagemPorStatus.afastados} afastados</span>
        </div>
      </div>
      
      <div className="bg-white rounded-2xl p-5 border border-slate-200">
        <p className="text-slate-500 text-sm font-medium">Folha Salarial</p>
        <p className="text-2xl font-bold text-slate-800 mt-1">{formatarMoeda(totalSalarios)}</p>
      </div>
      
      <div className="bg-white rounded-2xl p-5 border border-slate-200">
        <p className="text-slate-500 text-sm font-medium">Outros Proventos</p>
        <p className="text-2xl font-bold text-amber-600 mt-1">{formatarMoeda(totalOutrosProventos)}</p>
      </div>
      
      <div className="bg-white rounded-2xl p-5 border border-slate-200">
        <p className="text-slate-500 text-sm font-medium">Total Geral</p>
        <p className="text-2xl font-bold text-emerald-600 mt-1">
          {formatarMoeda(totalSalarios + totalOutrosProventos)}
        </p>
      </div>
    </div>
  )
}