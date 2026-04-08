// ============================================
// COMPONENTE: DETALHES FUNCIONÁRIO
// ============================================

import { CalendarDays, History, Clock, Plus } from 'lucide-react'
import { formatarData, formatarMoeda } from '@/utils/formatters'
import { PeriodoParaProgramacao } from '@/types/ferias'
import { BadgeSituacao } from './BadgeSituacao'
import { FuncionarioAgrupado } from './types'

interface DetalhesFuncionarioProps {
  funcionario: FuncionarioAgrupado
  onProgramar: (periodo: PeriodoParaProgramacao) => void
}

export function DetalhesFuncionario({ funcionario, onProgramar }: DetalhesFuncionarioProps) {
  const iniciais = funcionario.funcionario_nome
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')

  return (
    <div className="p-6 space-y-6">
      {/* Info Card */}
      <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
        <div className="w-14 h-14 rounded-full bg-teal-100 flex items-center justify-center">
          <span className="text-lg font-semibold text-teal-700">{iniciais}</span>
        </div>
        <div className="flex-1">
          <p className="font-medium text-slate-900">{funcionario.funcionario_nome}</p>
          <p className="text-sm text-slate-500">{funcionario.empresa_nome}</p>
          <p className="text-sm text-slate-600 mt-1">
            Salário: <strong>{formatarMoeda(funcionario.salario)}</strong>
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-teal-600">{funcionario.totalSaldo}d</p>
          <p className="text-xs text-slate-500">saldo total</p>
        </div>
      </div>

      {/* Períodos */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <CalendarDays className="w-4 h-4 text-slate-500" />
          <h3 className="text-sm font-medium text-slate-700">Períodos Aquisitivos</h3>
        </div>

        <div className="space-y-2">
          {funcionario.periodos.map((periodo) => (
            <div
              key={periodo.id}
              className="p-4 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-900">{periodo.numero}º Período</span>
                  <BadgeSituacao situacao={periodo.situacao} diasParaLimite={periodo.dias_para_limite} />
                </div>
                <span className="font-semibold text-teal-600">{periodo.saldo}d</span>
              </div>
              
              <div className="text-sm text-slate-500 mb-3">
                <p>Aquisitivo: {formatarData(periodo.data_inicio)} a {formatarData(periodo.data_fim)}</p>
                <p>Limite: {formatarData(periodo.data_limite)}</p>
              </div>

              <button
                onClick={() => onProgramar(periodo)}
                className="w-full px-3 py-2 text-sm font-medium text-teal-700 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Programar Férias
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Histórico */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <History className="w-4 h-4 text-slate-500" />
          <h3 className="text-sm font-medium text-slate-700">Histórico de Férias</h3>
        </div>

        <div className="p-4 bg-slate-50 rounded-lg text-center">
          <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500">Histórico será exibido aqui</p>
        </div>
      </div>
    </div>
  )
}
