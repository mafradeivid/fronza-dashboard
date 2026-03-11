// ============================================
// BADGE DE STATUS DO FUNCIONÁRIO
// ============================================

import { StatusFuncionario } from '@/types/pessoas'

interface BadgeStatusProps {
  status: StatusFuncionario
  tamanho?: 'sm' | 'md'
}

const CONFIG_STATUS: Record<StatusFuncionario, { label: string; bg: string; text: string }> = {
  ativo: {
    label: 'Ativo',
    bg: 'bg-emerald-100',
    text: 'text-emerald-700',
  },
  inativo: {
    label: 'Inativo',
    bg: 'bg-red-100',
    text: 'text-red-700',
  },
  afastado: {
    label: 'Afastado',
    bg: 'bg-amber-100',
    text: 'text-amber-700',
  },
}

export function BadgeStatus({ status, tamanho = 'md' }: BadgeStatusProps) {
  const config = CONFIG_STATUS[status] || CONFIG_STATUS.ativo

  const tamanhoClasses = tamanho === 'sm' 
    ? 'px-2 py-0.5 text-xs' 
    : 'px-2.5 py-1 text-xs'

  return (
    <span 
      className={`
        inline-flex items-center font-medium rounded-full
        ${config.bg} ${config.text} ${tamanhoClasses}
      `}
    >
      {config.label}
    </span>
  )
}