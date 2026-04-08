// ============================================
// TABELA: PERÍODOS AQUISITIVOS
// ============================================

'use client'

import { Calendar, AlertTriangle, CheckCircle, Clock, XCircle } from 'lucide-react'
import { 
  PeriodoAquisitivoComSaldo,
  STATUS_PERIODO_LABELS,
  STATUS_PERIODO_CORES,
  NIVEL_URGENCIA_CORES,
} from '@/types/ferias'
import { formatarData } from '@/utils/formatters'

interface TabelaPeriodosProps {
  periodos: PeriodoAquisitivoComSaldo[]
  onSelecionar?: (periodo: PeriodoAquisitivoComSaldo) => void
  onEditarFaltas?: (periodo: PeriodoAquisitivoComSaldo) => void
  carregando?: boolean
}

export function TabelaPeriodos({ 
  periodos, 
  onSelecionar,
  onEditarFaltas,
  carregando 
}: TabelaPeriodosProps) {
  if (carregando) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8">
        <div className="flex items-center justify-center gap-3 text-slate-400">
          <div className="w-5 h-5 border-2 border-slate-300 border-t-violet-500 rounded-full animate-spin" />
          Carregando períodos...
        </div>
      </div>
    )
  }

  if (periodos.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
        <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-500">Nenhum período aquisitivo encontrado</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-800 text-white">
            <tr>
              <th className="text-left p-4">Funcionário</th>
              <th className="text-center p-4">Período</th>
              <th className="text-center p-4">Aquisitivo</th>
              <th className="text-center p-4">Limite</th>
              <th className="text-center p-4">Dias</th>
              <th className="text-center p-4">Saldo</th>
              <th className="text-center p-4">Status</th>
              <th className="text-center p-4">Urgência</th>
            </tr>
          </thead>
          <tbody>
            {periodos.map((periodo) => (
              <tr
                key={periodo.id}
                className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                  onSelecionar ? 'cursor-pointer' : ''
                }`}
                onClick={() => onSelecionar?.(periodo)}
              >
                {/* Funcionário */}
                <td className="p-4">
                  <p className="font-medium text-slate-800">
                    {periodo.funcionario?.nome_completo || '-'}
                  </p>
                </td>

                {/* Número do Período */}
                <td className="p-4 text-center">
                  <span className="inline-flex items-center justify-center w-8 h-8 bg-violet-100 text-violet-700 rounded-full font-bold text-sm">
                    {periodo.numero}º
                  </span>
                </td>

                {/* Período Aquisitivo */}
                <td className="p-4 text-center text-sm">
                  <p className="text-slate-700">
                    {formatarData(periodo.data_inicio)}
                  </p>
                  <p className="text-slate-400">
                    até {formatarData(periodo.data_fim)}
                  </p>
                </td>

                {/* Limite Concessão */}
                <td className="p-4 text-center">
                  <p className={`text-sm font-medium ${
                    periodo.dias_para_vencer < 0 ? 'text-red-600' :
                    periodo.dias_para_vencer <= 30 ? 'text-orange-600' :
                    periodo.dias_para_vencer <= 60 ? 'text-amber-600' :
                    'text-slate-600'
                  }`}>
                    {formatarData(periodo.data_limite_concessao)}
                  </p>
                  <p className="text-xs text-slate-400">
                    {periodo.dias_para_vencer < 0 
                      ? `Vencido há ${Math.abs(periodo.dias_para_vencer)} dias`
                      : `em ${periodo.dias_para_vencer} dias`
                    }
                  </p>
                </td>

                {/* Dias de Direito */}
                <td className="p-4 text-center">
                  <div className="flex flex-col items-center">
                    <span className="font-bold text-slate-800">{periodo.dias_direito}</span>
                    {periodo.faltas_injustificadas > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onEditarFaltas?.(periodo)
                        }}
                        className="text-xs text-amber-600 hover:underline"
                      >
                        {periodo.faltas_injustificadas} faltas
                      </button>
                    )}
                  </div>
                </td>

                {/* Saldo */}
                <td className="p-4 text-center">
                  <div className="flex flex-col items-center">
                    <span className={`text-lg font-bold ${
                      periodo.dias_saldo === 0 ? 'text-slate-400' :
                      periodo.dias_saldo <= 10 ? 'text-amber-600' :
                      'text-emerald-600'
                    }`}>
                      {periodo.dias_saldo}
                    </span>
                    {(periodo.dias_gozados > 0 || periodo.dias_vendidos > 0) && (
                      <p className="text-xs text-slate-400">
                        {periodo.dias_gozados > 0 && `${periodo.dias_gozados} gozados`}
                        {periodo.dias_gozados > 0 && periodo.dias_vendidos > 0 && ' / '}
                        {periodo.dias_vendidos > 0 && `${periodo.dias_vendidos} vendidos`}
                      </p>
                    )}
                  </div>
                </td>

                {/* Status */}
                <td className="p-4 text-center">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_PERIODO_CORES[periodo.status]}`}>
                    {periodo.status === 'em_aquisicao' && <Clock className="w-3 h-3" />}
                    {periodo.status === 'adquirido' && <CheckCircle className="w-3 h-3" />}
                    {periodo.status === 'parcial' && <Calendar className="w-3 h-3" />}
                    {periodo.status === 'quitado' && <CheckCircle className="w-3 h-3" />}
                    {periodo.status === 'vencido' && <XCircle className="w-3 h-3" />}
                    {STATUS_PERIODO_LABELS[periodo.status]}
                  </span>
                </td>

                {/* Urgência */}
                <td className="p-4 text-center">
                  {periodo.status !== 'quitado' && periodo.status !== 'em_aquisicao' && (
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${NIVEL_URGENCIA_CORES[periodo.nivel_urgencia]}`}>
                      {(periodo.nivel_urgencia === 'critico' || periodo.nivel_urgencia === 'vencido') && (
                        <AlertTriangle className="w-3 h-3" />
                      )}
                      {periodo.nivel_urgencia === 'vencido' && 'Vencido'}
                      {periodo.nivel_urgencia === 'critico' && 'Crítico'}
                      {periodo.nivel_urgencia === 'alerta' && 'Alerta'}
                      {periodo.nivel_urgencia === 'atencao' && 'Atenção'}
                      {periodo.nivel_urgencia === 'ok' && 'OK'}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
