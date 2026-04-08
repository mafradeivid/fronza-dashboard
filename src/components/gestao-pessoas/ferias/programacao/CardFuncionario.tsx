// ============================================
// COMPONENTE: CARD FUNCIONÁRIO
// ============================================

import { ChevronRight } from 'lucide-react'
import { BadgeSituacao } from './BadgeSituacao'
import { FuncionarioAgrupado } from './types'

interface CardFuncionarioProps {
  funcionario: FuncionarioAgrupado
  onAbrir: () => void
}

export function CardFuncionario({ funcionario, onAbrir }: CardFuncionarioProps) {
  const iniciais = funcionario.funcionario_nome
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')

  // Barra lateral colorida
  const renderIndicador = () => {
    if (funcionario.temVencido) {
      return <div className="w-1 h-full bg-red-500 rounded-l-lg absolute left-0 top-0" />
    }
    if (funcionario.temCritico) {
      return <div className="w-1 h-full bg-orange-500 rounded-l-lg absolute left-0 top-0" />
    }
    return null
  }

  return (
    <div
      className="relative bg-white rounded-lg border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer overflow-hidden"
      onClick={onAbrir}
    >
      {renderIndicador()}
      
      <div className="p-4 pl-5 flex items-center justify-between">
        {/* Avatar + Nome */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-medium text-slate-600">{iniciais}</span>
          </div>

          <div className="min-w-0 flex-1">
            <p className="font-medium text-slate-900 truncate">{funcionario.funcionario_nome}</p>
            <p className="text-xs text-slate-500 truncate">{funcionario.empresa_nome}</p>
          </div>
        </div>

        {/* Info + Seta */}
        <div className="flex items-center gap-6">
          {/* Badge de urgência */}
          <div className="flex items-center gap-1">
            {funcionario.temVencido && <BadgeSituacao situacao="vencido" />}
            {funcionario.temCritico && !funcionario.temVencido && <BadgeSituacao situacao="critico" />}
            {!funcionario.temVencido && !funcionario.temCritico && funcionario.situacaoMaisUrgente === 'atencao' && (
              <BadgeSituacao situacao="atencao" />
            )}
          </div>

          {/* Contadores */}
          <div className="flex items-center gap-4 text-sm">
            <div className="text-center">
              <p className="font-semibold text-slate-900">{funcionario.periodos.length}</p>
              <p className="text-xs text-slate-500">períodos</p>
            </div>
            <div className="text-center">
              <p className="font-semibold text-teal-600">{funcionario.totalSaldo}d</p>
              <p className="text-xs text-slate-500">saldo</p>
            </div>
          </div>

          {/* Seta */}
          <ChevronRight className="w-5 h-5 text-slate-300" />
        </div>
      </div>
    </div>
  )
}