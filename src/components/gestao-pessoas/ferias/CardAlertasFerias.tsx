// ============================================
// CARD: ALERTAS DE FÉRIAS VENCENDO
// ============================================

'use client'

import { AlertTriangle, Calendar, Clock, ChevronRight } from 'lucide-react'
import { FeriasVencendo, NIVEL_URGENCIA_CORES, NIVEL_URGENCIA_LABELS } from '@/types/ferias'
import { formatarData } from '@/utils/formatters'

interface CardAlertasFeriasProps {
  alertas: FeriasVencendo[]
  onVerTodos?: () => void
  onSelecionar?: (periodoId: number, funcionarioId: number) => void
  limite?: number
  titulo?: string
}

export function CardAlertasFerias({
  alertas,
  onVerTodos,
  onSelecionar,
  limite = 5,
  titulo = 'Férias Vencendo',
}: CardAlertasFeriasProps) {
  const alertasExibidos = alertas.slice(0, limite)
  const temMais = alertas.length > limite

  if (alertas.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
            <Calendar className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">{titulo}</h3>
            <p className="text-sm text-slate-500">Nenhum alerta no momento</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-6 text-slate-400">
          <Clock className="w-5 h-5 mr-2" />
          Tudo em dia!
        </div>
      </div>
    )
  }

  // Contar por urgência
  const criticos = alertas.filter(a => a.nivel_urgencia === 'critico' || a.nivel_urgencia === 'vencido').length
  const emAlerta = alertas.filter(a => a.nivel_urgencia === 'alerta').length

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              criticos > 0 ? 'bg-red-100' : 'bg-amber-100'
            }`}>
              <AlertTriangle className={`w-5 h-5 ${
                criticos > 0 ? 'text-red-600' : 'text-amber-600'
              }`} />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">{titulo}</h3>
              <p className="text-sm text-slate-500">
                {alertas.length} período{alertas.length !== 1 ? 's' : ''} requer{alertas.length === 1 ? '' : 'em'} atenção
              </p>
            </div>
          </div>
          
          {/* Badges de contagem */}
          <div className="flex gap-2">
            {criticos > 0 && (
              <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">
                {criticos} crítico{criticos !== 1 ? 's' : ''}
              </span>
            )}
            {emAlerta > 0 && (
              <span className="px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">
                {emAlerta} alerta{emAlerta !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Lista de Alertas */}
      <div className="divide-y divide-slate-100">
        {alertasExibidos.map((alerta) => (
          <div
            key={alerta.periodo_id}
            className={`p-4 hover:bg-slate-50 transition-colors ${
              onSelecionar ? 'cursor-pointer' : ''
            }`}
            onClick={() => onSelecionar?.(alerta.periodo_id, alerta.funcionario_id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-800 truncate">
                  {alerta.nome_completo}
                </p>
                <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                  <span>{alerta.empresa_nome}</span>
                  <span>•</span>
                  <span>{alerta.periodo_numero}º período</span>
                  <span>•</span>
                  <span>{alerta.dias_restantes} dias de saldo</span>
                </div>
              </div>

              <div className="flex items-center gap-3 ml-4">
                {/* Data limite */}
                <div className="text-right">
                  <p className={`text-sm font-medium ${
                    alerta.nivel_urgencia === 'vencido' ? 'text-red-600' :
                    alerta.nivel_urgencia === 'critico' ? 'text-orange-600' :
                    'text-amber-600'
                  }`}>
                    {alerta.dias_para_vencer < 0 
                      ? `Vencido há ${Math.abs(alerta.dias_para_vencer)} dias`
                      : `em ${alerta.dias_para_vencer} dias`
                    }
                  </p>
                  <p className="text-xs text-slate-400">
                    {formatarData(alerta.data_limite_concessao)}
                  </p>
                </div>

                {/* Badge de urgência */}
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${NIVEL_URGENCIA_CORES[alerta.nivel_urgencia]}`}>
                  {NIVEL_URGENCIA_LABELS[alerta.nivel_urgencia]}
                </span>

                {onSelecionar && (
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Ver mais */}
      {temMais && onVerTodos && (
        <button
          onClick={onVerTodos}
          className="w-full p-4 text-center text-sm font-medium text-violet-600 hover:bg-violet-50 border-t border-slate-200 transition-colors"
        >
          Ver todos os {alertas.length} alertas
        </button>
      )}
    </div>
  )
}
