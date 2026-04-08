// ============================================
// TYPES INTERNOS: CÁLCULO DE CUSTOS
// Types de proporcionalidade (não expostos)
// ============================================

/**
 * Competência (mês/ano) - compatível com @/types/custoPessoal
 */
export interface Competencia {
  mes: number
  ano: number
  label: string
}

/**
 * Dados de proporcionalidade calculados
 */
export interface DadosProporcionalidade {
  diasTrabalhados: number
  diasMes: number
  fatorProporcional: number // 0 a 1 (ex: 0.5 = meio mês)
  salarioProporcional: number
  ativo: boolean // se deve contar na competência
  motivo?: 'mes_cheio' | 'admissao' | 'demissao' | 'inativo'
}

/**
 * Encargos calculados para um funcionário (com proporcionalidade)
 */
export interface EncargosCalculados {
  // Base
  salarioBase: number
  salarioProporcional: number
  outrosProventos: number
  
  // Encargos mensais
  fgts: number
  inssPatronal: number
  totalEncargos: number
  
  // Provisões
  provisao13: number
  provisaoFerias: number
  provisao13Ferias: number
  provisaoRescisao: number
  totalProvisoes: number
  
  // Custo total
  custoTotal: number
  
  // Meta
  proporcionalidade: DadosProporcionalidade
}