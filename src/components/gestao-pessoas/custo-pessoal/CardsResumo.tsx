'use client'

import { Wallet, Gift, Shield, PiggyBank, Sparkles, DollarSign } from 'lucide-react'
import { ResumoCustoCompleto } from '@/types/custoPessoal'
import { formatarMoeda } from '@/utils/formatters'

interface CardsResumoProps {
  resumo: ResumoCustoCompleto | null
  percentuais: {
    salarios: number
    outrosProventos: number
    encargos: number
    provisoes: number
    extras: number
  }
  periodoLabel: string
}

export function CardsResumo({ resumo, percentuais, periodoLabel }: CardsResumoProps) {
  const cards = [
    {
      label: 'Salários',
      valor: resumo?.salarios || 0,
      percentual: percentuais.salarios,
      icone: Wallet,
      cor: 'blue',
      bgGradient: 'from-blue-500 to-blue-600',
      bgLight: 'bg-blue-50',
      textColor: 'text-blue-700',
    },
    {
      label: 'Outros Proventos',
      valor: resumo?.outrosProventos || 0,
      percentual: percentuais.outrosProventos,
      icone: Gift,
      cor: 'violet',
      bgGradient: 'from-violet-500 to-violet-600',
      bgLight: 'bg-violet-50',
      textColor: 'text-violet-700',
    },
    {
      label: 'Encargos',
      valor: resumo?.totalEncargos || 0,
      percentual: percentuais.encargos,
      icone: Shield,
      cor: 'amber',
      bgGradient: 'from-amber-500 to-amber-600',
      bgLight: 'bg-amber-50',
      textColor: 'text-amber-700',
      detalhe: `FGTS: ${formatarMoeda(resumo?.fgts || 0)} | INSS: ${formatarMoeda(resumo?.inssPatronal || 0)}`,
    },
    {
      label: 'Provisões',
      valor: resumo?.totalProvisoes || 0,
      percentual: percentuais.provisoes,
      icone: PiggyBank,
      cor: 'emerald',
      bgGradient: 'from-emerald-500 to-emerald-600',
      bgLight: 'bg-emerald-50',
      textColor: 'text-emerald-700',
      detalhe: `13º + Férias + 1/3 + Rescisão`,
    },
    {
      label: 'Pagamentos Extras',
      valor: resumo?.pagamentosExtras || 0,
      percentual: percentuais.extras,
      icone: Sparkles,
      cor: 'pink',
      bgGradient: 'from-pink-500 to-pink-600',
      bgLight: 'bg-pink-50',
      textColor: 'text-pink-700',
    },
  ]

  return (
    <div className="mb-6">
      {/* Título do período */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium text-slate-500">Resumo do Período: {periodoLabel}</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Cards de componentes */}
        {cards.map((card) => {
          const Icon = card.icone
          return (
            <div
              key={card.label}
              className={`${card.bgLight} rounded-xl p-4 border border-slate-100`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${card.textColor}`} />
                <span className={`text-xs font-medium ${card.textColor}`}>{card.label}</span>
              </div>
              <p className={`text-xl font-bold ${card.textColor}`}>
                {formatarMoeda(card.valor)}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {card.percentual.toFixed(1)}% do total
              </p>
              {card.detalhe && (
                <p className="text-xs text-slate-400 mt-1 truncate" title={card.detalhe}>
                  {card.detalhe}
                </p>
              )}
            </div>
          )
        })}

        {/* Card Total */}
        <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-slate-300" />
            <span className="text-xs font-medium text-slate-300">CUSTO TOTAL</span>
          </div>
          <p className="text-2xl font-bold">
            {formatarMoeda(resumo?.custoTotal || 0)}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            100% do período
          </p>
        </div>
      </div>
    </div>
  )
}