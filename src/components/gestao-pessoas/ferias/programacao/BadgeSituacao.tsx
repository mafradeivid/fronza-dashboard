// ============================================
// COMPONENTE: BADGE SITUAÇÃO
// ============================================

import { AlertTriangle } from 'lucide-react'
import { SITUACAO_CONFIG, SituacaoPeriodo } from '@/types/ferias'

interface BadgeSituacaoProps {
  situacao: SituacaoPeriodo
  diasParaLimite?: number
  tamanho?: 'sm' | 'md'
}

export function BadgeSituacao({ situacao, diasParaLimite, tamanho = 'sm' }: BadgeSituacaoProps) {
  const config = SITUACAO_CONFIG[situacao]
  
  let label = config.label
  if (diasParaLimite !== undefined && ['critico', 'atencao', 'normal'].includes(situacao)) {
    label = `${diasParaLimite}d`
  }

  const classes = tamanho === 'sm' 
    ? 'px-2 py-0.5 text-xs'
    : 'px-2.5 py-1 text-sm'

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${classes}`}
      style={{ backgroundColor: config.bg, color: config.cor }}
    >
      {situacao === 'vencido' && <AlertTriangle className="w-3 h-3" />}
      {label}
    </span>
  )
}
