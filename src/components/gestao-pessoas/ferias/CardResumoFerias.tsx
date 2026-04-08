// ============================================
// CARD: RESUMO DE FÉRIAS
// ============================================

'use client'

import { Calendar, AlertTriangle, XCircle, ClipboardList } from 'lucide-react'
import { EstatisticasFerias } from '@/services/ferias'

interface CardResumoFeriasProps {
  estatisticas: EstatisticasFerias | null
  carregando?: boolean
}

export function CardResumoFerias({ estatisticas, carregando }: CardResumoFeriasProps) {
  if (carregando) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-slate-200 animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-24 mb-2" />
            <div className="h-8 bg-slate-200 rounded w-16" />
          </div>
        ))}
      </div>
    )
  }

  if (!estatisticas) return null

  // Calcular períodos a programar (com saldo > 0 que precisam programação)
  const periodosAProgramar = estatisticas.periodosAProgramar ?? estatisticas.funcionariosComSaldo

  const cards = [
    {
      label: 'Férias a Programar',
      valor: periodosAProgramar,
      sublabel: 'períodos pendentes',
      icone: ClipboardList,
      cor: 'violet',
      bg: 'bg-gradient-to-br from-violet-500 to-violet-600',
      texto: 'text-white',
    },
    {
      label: 'Programadas',
      valor: estatisticas.totalDiasProgramados,
      sublabel: 'dias agendados',
      icone: Calendar,
      cor: 'emerald',
      bg: 'bg-white',
      texto: 'text-emerald-600',
      borda: 'border border-slate-200',
    },
    {
      label: 'Períodos Críticos',
      valor: estatisticas.periodosCriticos,
      sublabel: 'Vencendo em 30 dias',
      icone: AlertTriangle,
      cor: 'amber',
      bg: 'bg-white',
      texto: 'text-amber-600',
      borda: 'border border-slate-200',
      destaque: estatisticas.periodosCriticos > 0,
    },
    {
      label: 'Férias Vencidas',
      valor: estatisticas.periodosVencidos,
      sublabel: 'Requer ação imediata',
      icone: XCircle,
      cor: 'red',
      bg: 'bg-white',
      texto: 'text-red-600',
      borda: 'border border-slate-200',
      destaque: estatisticas.periodosVencidos > 0,
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icone = card.icone
        return (
          <div
            key={index}
            className={`rounded-2xl p-5 ${card.bg} ${card.borda || ''} ${
              card.destaque ? 'ring-2 ring-red-300' : ''
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Icone className={`w-4 h-4 ${card.texto === 'text-white' ? 'text-white/80' : card.texto}`} />
              <p className={`text-sm font-medium ${card.texto === 'text-white' ? 'text-white/80' : 'text-slate-500'}`}>
                {card.label}
              </p>
            </div>
            <p className={`text-3xl font-bold ${card.texto}`}>
              {card.valor}
            </p>
            <p className={`text-xs mt-1 ${card.texto === 'text-white' ? 'text-white/60' : 'text-slate-400'}`}>
              {card.sublabel}
            </p>
          </div>
        )
      })}
    </div>
  )
}