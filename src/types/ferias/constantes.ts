// ============================================
// CONSTANTES: SISTEMA DE FÉRIAS
// ============================================

// ============================================
// TIPOS DE STATUS
// ============================================

export type StatusPeriodo = 'em_aquisicao' | 'adquirido' | 'parcial' | 'quitado' | 'vencido'

export type StatusLancamento = 'programado' | 'em_gozo' | 'concluido' | 'cancelado'

export type StatusFeriasColetivas = 'programada' | 'em_andamento' | 'concluida' | 'cancelada'

export type NivelUrgencia = 'ok' | 'atencao' | 'alerta' | 'critico' | 'vencido'

// ============================================
// LABELS
// ============================================

export const STATUS_PERIODO_LABELS: Record<StatusPeriodo, string> = {
  em_aquisicao: 'Em Aquisição',
  adquirido: 'Adquirido',
  parcial: 'Parcialmente Gozado',
  quitado: 'Quitado',
  vencido: 'Vencido',
}

export const STATUS_LANCAMENTO_LABELS: Record<StatusLancamento, string> = {
  programado: 'Programado',
  em_gozo: 'Em Gozo',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
}

export const STATUS_COLETIVAS_LABELS: Record<StatusFeriasColetivas, string> = {
  programada: 'Programada',
  em_andamento: 'Em Andamento',
  concluida: 'Concluída',
  cancelada: 'Cancelada',
}

export const NIVEL_URGENCIA_LABELS: Record<NivelUrgencia, string> = {
  ok: 'OK',
  atencao: 'Atenção',
  alerta: 'Alerta',
  critico: 'Crítico',
  vencido: 'Vencido',
}

// ============================================
// CORES (Tailwind classes)
// ============================================

export const STATUS_PERIODO_CORES: Record<StatusPeriodo, string> = {
  em_aquisicao: 'bg-blue-100 text-blue-700',
  adquirido: 'bg-emerald-100 text-emerald-700',
  parcial: 'bg-amber-100 text-amber-700',
  quitado: 'bg-slate-100 text-slate-700',
  vencido: 'bg-red-100 text-red-700',
}

export const STATUS_LANCAMENTO_CORES: Record<StatusLancamento, string> = {
  programado: 'bg-blue-100 text-blue-700',
  em_gozo: 'bg-amber-100 text-amber-700',
  concluido: 'bg-emerald-100 text-emerald-700',
  cancelado: 'bg-slate-100 text-slate-700',
}

export const NIVEL_URGENCIA_CORES: Record<NivelUrgencia, string> = {
  ok: 'bg-emerald-100 text-emerald-700',
  atencao: 'bg-blue-100 text-blue-700',
  alerta: 'bg-amber-100 text-amber-700',
  critico: 'bg-orange-100 text-orange-700',
  vencido: 'bg-red-100 text-red-700',
}

// ============================================
// REGRAS CLT
// ============================================

/**
 * CLT Art. 130 - Redução de férias por faltas injustificadas
 */
export const TABELA_FALTAS_FERIAS = [
  { faltasAte: 5, diasDireito: 30 },
  { faltasAte: 14, diasDireito: 24 },
  { faltasAte: 23, diasDireito: 18 },
  { faltasAte: 32, diasDireito: 12 },
  { faltasAte: Infinity, diasDireito: 0 }, // Perde o direito
] as const

/**
 * Regras de fracionamento (CLT Art. 134 §1º)
 */
export const REGRAS_FRACIONAMENTO = {
  maximoParcelas: 3,
  minimoDiasPrimeiraParcela: 14,
  minimoDiasDemaisParcelas: 5,
} as const

/**
 * Regras de abono pecuniário (CLT Art. 143)
 */
export const REGRAS_ABONO = {
  maximoDias: 10, // Pode vender até 1/3
} as const

/**
 * Período aquisitivo (CLT Art. 130)
 */
export const PERIODO_AQUISITIVO = {
  meses: 12,
  diasPorMes: 2.5, // 30 ÷ 12
  diasTotais: 30,
} as const

/**
 * Período concessivo (CLT Art. 134)
 */
export const PERIODO_CONCESSIVO = {
  meses: 12, // 12 meses após o aquisitivo
} as const