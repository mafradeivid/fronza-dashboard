// ============================================
// COMPONENTE: FORMULÁRIO PROGRAMAÇÃO
// ============================================

import { formatarData } from '@/utils/formatters'
import { PeriodoParaProgramacao, CalculoProgramacao } from '@/types/ferias'
import { BadgeSituacao } from './BadgeSituacao'
import { ResumoFinanceiro } from './ResumoFinanceiro'

interface FormularioProgramacaoProps {
  periodo: PeriodoParaProgramacao
  diasGozo: number
  diasAbono: number
  dataInicio: string
  erro: string | null
  calculo: CalculoProgramacao | null
  onDiasGozoChange: (dias: number) => void
  onDiasAbonoChange: (dias: number) => void
  onDataInicioChange: (data: string) => void
}

export function FormularioProgramacao({
  periodo,
  diasGozo,
  diasAbono,
  dataInicio,
  erro,
  calculo,
  onDiasGozoChange,
  onDiasAbonoChange,
  onDataInicioChange,
}: FormularioProgramacaoProps) {
  return (
    <div className="p-6 space-y-4">
      {/* Dados do Período */}
      <div className="p-4 bg-teal-50 rounded-lg border border-teal-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-teal-800">
            Período: {formatarData(periodo.data_inicio)} a {formatarData(periodo.data_fim)}
          </span>
          <BadgeSituacao situacao={periodo.situacao} diasParaLimite={periodo.dias_para_limite} />
        </div>
        <p className="text-xs text-teal-700">
          Limite: {formatarData(periodo.data_limite)} · Saldo: <strong>{periodo.saldo} dias</strong>
        </p>
      </div>

      {/* Campos */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Data de início das férias
          </label>
          <input
            type="date"
            value={dataInicio}
            onChange={(e) => onDataInicioChange(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Dias de gozo
            </label>
            <input
              type="number"
              min={5}
              max={periodo.saldo}
              value={diasGozo}
              onChange={(e) => onDiasGozoChange(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
            />
            <p className="text-xs text-slate-500 mt-1">Mínimo 5 dias (CLT)</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Abono pecuniário
            </label>
            <input
              type="number"
              min={0}
              max={10}
              value={diasAbono}
              onChange={(e) => onDiasAbonoChange(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
            />
            <p className="text-xs text-slate-500 mt-1">Máximo 10 dias</p>
          </div>
        </div>
      </div>

      {/* Resumo */}
      {calculo && <ResumoFinanceiro calculo={calculo} />}

      {/* Erro */}
      {erro && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{erro}</p>
        </div>
      )}
    </div>
  )
}
