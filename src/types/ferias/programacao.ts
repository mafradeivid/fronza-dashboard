// ============================================
// TIPOS: PROGRAMAÇÃO DE FÉRIAS
// ============================================

// Situação do período (para ordenação e badge)
export type SituacaoPeriodo = 
  | 'vencido'      // Limite já passou
  | 'critico'      // < 60 dias para vencer
  | 'atencao'      // < 90 dias para vencer
  | 'normal'       // OK
  | 'em_aquisicao' // Ainda adquirindo
  | 'quitado'      // Sem saldo

// Cores e labels para cada situação
export const SITUACAO_CONFIG: Record<SituacaoPeriodo, {
  label: string
  cor: string
  bg: string
  ordem: number
}> = {
  vencido: {
    label: 'Vencido',
    cor: '#DC2626',     // red-600
    bg: '#FEF2F2',      // red-50
    ordem: 0,
  },
  critico: {
    label: 'Crítico',
    cor: '#EA580C',     // orange-600
    bg: '#FFF7ED',      // orange-50
    ordem: 1,
  },
  atencao: {
    label: 'Atenção',
    cor: '#CA8A04',     // yellow-600
    bg: '#FEFCE8',      // yellow-50
    ordem: 2,
  },
  normal: {
    label: 'Normal',
    cor: '#16A34A',     // green-600
    bg: '#F0FDF4',      // green-50
    ordem: 3,
  },
  em_aquisicao: {
    label: 'Em aquisição',
    cor: '#0D9488',     // teal-600
    bg: '#CCFBF1',      // teal-100
    ordem: 4,
  },
  quitado: {
    label: 'Quitado',
    cor: '#64748B',     // slate-500
    bg: '#F1F5F9',      // slate-100
    ordem: 5,
  },
}

// Período com situação calculada (para lista)
export interface PeriodoParaProgramacao {
  id: number
  funcionario_id: number
  funcionario_nome: string
  funcionario_matricula?: string
  empresa_id: number
  empresa_nome: string
  salario: number
  
  numero: number
  data_inicio: string
  data_fim: string
  data_limite: string
  data_limite_concessao: string  // Alias para compatibilidade
  
  dias_direito: number
  dias_gozados: number
  dias_vendidos: number
  saldo: number
  
  situacao: SituacaoPeriodo
  status: string  // Status original do banco
  dias_para_limite: number
}

// Dados para programar férias (input do formulário)
export interface DadosProgramacao {
  periodo_id: number
  funcionario_id: number
  data_inicio: string
  dias_gozo: number
  dias_abono: number
}

// Resultado do cálculo de programação (diferente do CalculoFerias existente)
export interface CalculoProgramacao {
  // Dias
  dias_gozo: number
  dias_abono: number
  
  // Datas
  data_inicio: string
  data_fim: string
  data_retorno: string
  data_pagamento: string
  
  // Valores
  salario_dia: number
  valor_ferias: number
  valor_terco: number
  valor_abono: number
  valor_terco_abono: number
  valor_total: number
  
  // Saldo
  saldo_antes: number
  saldo_depois: number
}

// Filtros da lista
export interface FiltrosProgramacao {
  empresa_id?: number
  situacao?: SituacaoPeriodo | 'todos'
  busca?: string
}

// Férias no calendário
export interface FeriasCalendarioItem {
  id: number
  funcionario_id: number
  funcionario_nome: string
  data_inicio: string
  data_fim: string
  dias: number
  cor: string
}

// Estatísticas para dashboard
export interface EstatisticasProgramacao {
  total_funcionarios: number
  vencidos: number
  criticos: number
  atencao: number
  programados_mes: number
  em_ferias_hoje: number
}

// Validação de programação
export interface ValidacaoProgramacao {
  valido: boolean
  erros: string[]
}

// Constantes CLT
export const FERIAS_CONFIG = {
  DIAS_MINIMO_PARCELA: 5,
  DIAS_MAXIMO_ABONO: 10,
  PARCELAS_MAXIMAS: 3,
  DIAS_ANTECEDENCIA_PAGAMENTO: 2,
  DIAS_LIMITE_CRITICO: 60,
  DIAS_LIMITE_ATENCAO: 90,
} as const