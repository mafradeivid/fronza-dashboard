// ============================================
// TYPES: PROPORCIONALIDADE DE CÁLCULOS
// Baseado na CLT Art. 64 e padrões de ERP
// ============================================

/**
 * Método de divisor para cálculo proporcional
 * - dias_reais: usa 28/29/30/31 conforme o mês (RECOMENDADO pela CLT)
 * - sempre_30: sempre divide por 30 (simplificado)
 * - comercial: 30 dias, exceto fevereiro
 */
export type MetodoDivisor = 'dias_reais' | 'sempre_30' | 'comercial'

/**
 * Configuração de cálculo por empresa
 */
export interface ConfigCalculo {
  id?: string         // UUID
  empresa_id: string  // UUID
  metodo_divisor: MetodoDivisor
  excecao_fevereiro: boolean
  incluir_dia_admissao: boolean
  incluir_dia_demissao: boolean
  created_at?: string
  updated_at?: string
}

/**
 * Resultado de um cálculo proporcional
 */
export interface ResultadoCalculo {
  valor_proporcional: number
  dias_trabalhados: number
  dias_mes: number
  divisor_usado: number
  valor_diario: number
  metodo: MetodoDivisor
}

/**
 * Dados para cálculo de admissão
 */
export interface DadosCalculoAdmissao {
  salario_base: number
  data_admissao: string
  ano: number
  mes: number
}

/**
 * Dados para cálculo de demissão/rescisão
 */
export interface DadosCalculoDemissao {
  salario_base: number
  data_demissao: string
  data_ultimo_dia?: string
  ano: number
  mes: number
  aviso_previo: boolean
}

/**
 * Resultado de férias proporcionais
 */
export interface ResultadoFerias extends ResultadoCalculo {
  meses_direito: number
  valor_terco: number
  valor_total: number
}

/**
 * Resultado de 13º salário proporcional
 */
export interface Resultado13Salario extends ResultadoCalculo {
  meses_ano: number
}

/**
 * Resumo completo de proporcionalidade (rescisão)
 */
export interface ResumoProporcionalidade {
  saldo_salario: ResultadoCalculo
  ferias_proporcionais?: ResultadoFerias
  decimo_terceiro_proporcional?: Resultado13Salario
  aviso_previo?: ResultadoCalculo
  multa_fgts?: number
  total: number
}

/**
 * Log de cálculo para auditoria
 */
export interface LogCalculo {
  id?: string         // UUID
  empresa_id: string  // UUID
  funcionario_id: string  // UUID
  tipo_calculo: 'admissao' | 'demissao' | 'falta' | 'ferias' | '13_salario'
  resultado: object
  created_at?: string
}

// ============================================
// VALORES INICIAIS
// ============================================

export const CONFIG_CALCULO_INICIAL: ConfigCalculo = {
  empresa_id: '',  // UUID
  metodo_divisor: 'dias_reais',
  excecao_fevereiro: true,
  incluir_dia_admissao: true,
  incluir_dia_demissao: true,
}

export const RESULTADO_CALCULO_VAZIO: ResultadoCalculo = {
  valor_proporcional: 0,
  dias_trabalhados: 0,
  dias_mes: 30,
  divisor_usado: 30,
  valor_diario: 0,
  metodo: 'dias_reais',
}