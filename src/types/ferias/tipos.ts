// ============================================
// TIPOS: SISTEMA DE FÉRIAS
// ============================================

import { 
  StatusPeriodo, 
  StatusLancamento, 
  StatusFeriasColetivas,
  NivelUrgencia 
} from './constantes'

// ============================================
// INTERFACES PRINCIPAIS
// ============================================

/**
 * Período Aquisitivo
 */
export interface PeriodoAquisitivo {
  id: number
  funcionario_id: number
  numero: number
  data_inicio: string
  data_fim: string
  data_limite_concessao: string
  dias_direito: number
  dias_gozados: number
  dias_vendidos: number
  dias_programados: number
  faltas_injustificadas: number
  status: StatusPeriodo
  observacoes: string | null
  created_at: string
  updated_at: string
  
  // Joins
  funcionario?: {
    id: number
    nome_completo: string
    empresa_id: number
    admissao: string
  }
}

/**
 * Período com cálculos derivados
 */
export interface PeriodoAquisitivoComSaldo extends PeriodoAquisitivo {
  dias_saldo: number
  dias_para_vencer: number
  nivel_urgencia: NivelUrgencia
  pode_fracionar: boolean
  parcelas_usadas: number
}

/**
 * Lançamento de Férias
 */
export interface LancamentoFerias {
  id?: number
  periodo_aquisitivo_id: number
  funcionario_id: number
  data_inicio: string
  data_fim: string
  dias_gozados: number
  dias_abono: number
  parcela: number
  
  // Valores
  salario_base: number
  media_horas_extras: number
  media_comissoes: number
  media_adicional_noturno: number
  media_periculosidade: number
  media_insalubridade: number
  outros_adicionais: number
  descricao_outros_adicionais: string | null
  base_calculo: number
  valor_ferias: number
  valor_terco: number
  valor_abono: number
  valor_terco_abono: number
  valor_total: number
  
  status: StatusLancamento
  observacoes: string | null
  created_at?: string
  updated_at?: string
  
  // Joins
  periodo_aquisitivo?: PeriodoAquisitivo
  funcionario?: {
    id: number
    nome_completo: string
    empresa_id: number
  }
}

/**
 * Férias Coletivas
 */
export interface FeriasColetivas {
  id?: number
  empresa_id: number
  setor_id: string | null
  data_inicio: string
  data_fim: string
  dias: number
  descricao: string | null
  ano_referencia: number
  status: StatusFeriasColetivas
  created_at?: string
  updated_at?: string
  
  // Joins
  empresa?: {
    id: number
    razao_social: string
  }
  funcionarios?: FeriasColetvasFuncionario[]
}

/**
 * Funcionário em Férias Coletivas
 */
export interface FeriasColetvasFuncionario {
  id?: number
  ferias_coletiva_id: number
  funcionario_id: number
  periodo_aquisitivo_id: number | null
  dias_debitados: number
  proporcional: boolean
  
  // Joins
  funcionario?: {
    id: number
    nome_completo: string
  }
}

/**
 * Configurações de Férias por Empresa
 */
export interface ConfigFerias {
  id?: number
  empresa_id: number
  alerta_vencimento_dias: number
  alerta_concessivo_dias: number
  permitir_fracionamento: boolean
  minimo_dias_primeira_parcela: number
  minimo_dias_demais_parcelas: number
  permitir_abono: boolean
  maximo_dias_abono: number
}

// ============================================
// VIEWS / AGREGAÇÕES
// ============================================

/**
 * Saldo de Férias por Funcionário (da view vw_saldo_ferias)
 */
export interface SaldoFeriasFuncionario {
  funcionario_id: number
  nome_completo: string
  empresa_id: number
  empresa_nome: string
  admissao: string
  status_funcionario: string
  
  total_dias_direito: number
  total_dias_gozados: number
  total_dias_vendidos: number
  total_dias_programados: number
  saldo_disponivel: number
  
  periodos_em_aquisicao: number
  periodos_adquiridos: number
  periodos_parciais: number
  periodos_vencidos: number
  
  alerta_vencendo: boolean
  tem_ferias_vencidas: boolean
}

/**
 * Férias Vencendo (da view vw_ferias_vencendo)
 */
export interface FeriasVencendo {
  periodo_id: number
  funcionario_id: number
  nome_completo: string
  empresa_id: number
  empresa_nome: string
  periodo_numero: number
  data_inicio: string
  data_fim: string
  data_limite_concessao: string
  dias_direito: number
  dias_gozados: number
  dias_vendidos: number
  dias_restantes: number
  status: StatusPeriodo
  dias_para_vencer: number
  nivel_urgencia: NivelUrgencia
}

// ============================================
// DTOs (Data Transfer Objects)
// ============================================

/**
 * Dados para criar um lançamento de férias
 */
export interface NovoLancamentoFerias {
  periodo_aquisitivo_id: number
  funcionario_id: number
  data_inicio: string
  data_fim: string
  dias_gozados: number
  dias_abono?: number
  parcela?: number
  
  // Adicionais (opcionais)
  media_horas_extras?: number
  media_comissoes?: number
  media_adicional_noturno?: number
  media_periculosidade?: number
  media_insalubridade?: number
  outros_adicionais?: number
  descricao_outros_adicionais?: string
  
  observacoes?: string
}

/**
 * Dados para programar férias coletivas
 */
export interface NovasFeriasColetivas {
  empresa_id: number
  setor_id?: string | null
  data_inicio: string
  data_fim: string
  dias: number
  descricao?: string
  ano_referencia: number
  funcionarios_ids: number[]
}

/**
 * Filtros para listar períodos
 */
export interface FiltrosPeriodos {
  funcionario_id?: number
  empresa_id?: number
  status?: StatusPeriodo | StatusPeriodo[]
  vencendo_em_dias?: number
  apenas_com_saldo?: boolean
}

/**
 * Filtros para listar lançamentos
 */
export interface FiltrosLancamentos {
  funcionario_id?: number
  empresa_id?: number
  periodo_aquisitivo_id?: number
  status?: StatusLancamento | StatusLancamento[]
  data_inicio_de?: string
  data_inicio_ate?: string
}

// ============================================
// CÁLCULOS
// ============================================

/**
 * Resultado do cálculo de férias
 */
export interface CalculoFerias {
  // Base
  salario_base: number
  
  // Adicionais
  media_horas_extras: number
  media_comissoes: number
  media_adicional_noturno: number
  media_periculosidade: number
  media_insalubridade: number
  outros_adicionais: number
  
  // Totais
  base_calculo: number         // salário + todos adicionais
  
  // Férias
  dias_gozados: number
  valor_ferias: number         // (base ÷ 30) × dias
  valor_terco: number          // valor_ferias ÷ 3
  
  // Abono (se houver)
  dias_abono: number
  valor_abono: number          // (base ÷ 30) × dias_abono
  valor_terco_abono: number    // valor_abono ÷ 3
  
  // Total
  valor_total: number          // soma de tudo
}

// ============================================
// VALORES INICIAIS
// ============================================

export const LANCAMENTO_INICIAL: Partial<LancamentoFerias> = {
  dias_gozados: 30,
  dias_abono: 0,
  parcela: 1,
  media_horas_extras: 0,
  media_comissoes: 0,
  media_adicional_noturno: 0,
  media_periculosidade: 0,
  media_insalubridade: 0,
  outros_adicionais: 0,
  descricao_outros_adicionais: null,
  status: 'programado',
  observacoes: null,
}

export const CONFIG_FERIAS_INICIAL: Omit<ConfigFerias, 'empresa_id'> = {
  alerta_vencimento_dias: 60,
  alerta_concessivo_dias: 90,
  permitir_fracionamento: true,
  minimo_dias_primeira_parcela: 14,
  minimo_dias_demais_parcelas: 5,
  permitir_abono: true,
  maximo_dias_abono: 10,
}