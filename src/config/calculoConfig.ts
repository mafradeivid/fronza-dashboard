// ============================================
// CONFIG: CONSTANTES DE CÁLCULOS TRABALHISTAS
// Baseado na CLT e legislação brasileira
// ============================================

// ============================================
// DIAS E HORAS
// ============================================

/** Dias do mês comercial (padrão CLT) */
export const DIAS_MES_COMERCIAL = 30

/** Horas mensais padrão (44h semanais) */
export const HORAS_MES_PADRAO = 220

/** Horas diárias padrão */
export const HORAS_DIA_PADRAO = 8

/** Dias da semana de trabalho */
export const DIAS_SEMANA_TRABALHO = 6

// ============================================
// PERCENTUAIS LEGAIS
// ============================================

/** Percentual de férias (1/12 = 8.33%) */
export const PERCENTUAL_FERIAS = 1 / 12

/** Percentual do terço de férias (1/3 = 33.33%) */
export const PERCENTUAL_TERCO_FERIAS = 1 / 3

/** Percentual de 13º salário por mês (1/12 = 8.33%) */
export const PERCENTUAL_13_SALARIO = 1 / 12

/** Percentual de FGTS (8%) */
export const PERCENTUAL_FGTS = 0.08

/** Multa FGTS - Demissão sem justa causa (40%) */
export const PERCENTUAL_MULTA_FGTS = 0.40

/** Multa FGTS - Demissão por acordo (20%) */
export const PERCENTUAL_MULTA_FGTS_ACORDO = 0.20

/** Dias mínimos no mês para contar como mês cheio (férias/13º) */
export const DIAS_MINIMOS_MES_CHEIO = 15

// ============================================
// AVISO PRÉVIO
// ============================================

/** Dias base de aviso prévio */
export const AVISO_PREVIO_BASE = 30

/** Dias adicionais por ano trabalhado (máx 60 dias) */
export const AVISO_PREVIO_ADICIONAL_POR_ANO = 3

/** Máximo de dias adicionais de aviso prévio */
export const AVISO_PREVIO_ADICIONAL_MAXIMO = 60

// ============================================
// DIAS FIXOS POR MÊS (para referência)
// ============================================

export const DIAS_POR_MES: Record<number, number> = {
  1: 31,  // Janeiro
  2: 28,  // Fevereiro (padrão, ajustar para bissexto)
  3: 31,  // Março
  4: 30,  // Abril
  5: 31,  // Maio
  6: 30,  // Junho
  7: 31,  // Julho
  8: 31,  // Agosto
  9: 30,  // Setembro
  10: 31, // Outubro
  11: 30, // Novembro
  12: 31, // Dezembro
}

// ============================================
// LABELS PARA UI
// ============================================

export const METODOS_DIVISOR_LABELS: Record<string, string> = {
  dias_reais: 'Dias reais do mês (28/29/30/31) - Recomendado',
  sempre_30: 'Sempre 30 dias',
  comercial: '30 dias, exceto fevereiro',
}

export const TIPOS_DEMISSAO_LABELS: Record<number, string> = {
  1: 'Sem justa causa',
  2: 'Com justa causa',
  3: 'Pedido de demissão',
  4: 'Acordo entre as partes',
  5: 'Término de contrato',
  6: 'Falecimento',
}