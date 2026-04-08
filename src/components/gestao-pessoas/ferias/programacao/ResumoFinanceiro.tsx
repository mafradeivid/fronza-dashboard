// ============================================
// COMPONENTE: RESUMO FINANCEIRO
// ============================================

import { DollarSign } from 'lucide-react'
import { formatarData, formatarMoeda } from '@/utils/formatters'
import { CalculoProgramacao } from '@/types/ferias'

interface ResumoFinanceiroProps {
  calculo: CalculoProgramacao
}

export function ResumoFinanceiro({ calculo }: ResumoFinanceiroProps) {
  return (
    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
      <div className="flex items-center gap-2 mb-3">
        <DollarSign className="w-4 h-4 text-slate-500" />
        <h4 className="text-sm font-medium text-slate-700">Resumo Financeiro</h4>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-600">Férias ({calculo.dias_gozo} dias)</span>
          <span className="text-slate-900">{formatarMoeda(calculo.valor_ferias)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-600">1/3 Constitucional</span>
          <span className="text-slate-900">{formatarMoeda(calculo.valor_terco)}</span>
        </div>
        
        {calculo.dias_abono > 0 && (
          <>
            <div className="flex justify-between">
              <span className="text-slate-600">Abono ({calculo.dias_abono} dias)</span>
              <span className="text-slate-900">{formatarMoeda(calculo.valor_abono)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">1/3 sobre Abono</span>
              <span className="text-slate-900">{formatarMoeda(calculo.valor_terco_abono)}</span>
            </div>
          </>
        )}
        
        <div className="flex justify-between pt-2 border-t border-slate-200 font-semibold">
          <span className="text-slate-900">Total a pagar</span>
          <span className="text-teal-600">{formatarMoeda(calculo.valor_total)}</span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-200 grid grid-cols-2 gap-2 text-xs text-slate-500">
        <p>Fim: <strong className="text-slate-700">{formatarData(calculo.data_fim)}</strong></p>
        <p>Retorno: <strong className="text-slate-700">{formatarData(calculo.data_retorno)}</strong></p>
        <p>Pagamento até: <strong className="text-slate-700">{formatarData(calculo.data_pagamento)}</strong></p>
        <p>Saldo após: <strong className="text-slate-700">{calculo.saldo_depois} dias</strong></p>
      </div>
    </div>
  )
}
