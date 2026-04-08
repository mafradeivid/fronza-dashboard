// ============================================
// CÁLCULOS: SISTEMA DE FÉRIAS
// ============================================

import { TABELA_FALTAS_FERIAS } from './constantes'
import { CalculoFerias } from './tipos'

// ============================================
// CÁLCULO DE DIAS DE DIREITO
// ============================================

/**
 * Calcula dias de direito baseado nas faltas (CLT Art. 130)
 * 
 * @param faltas - Número de faltas injustificadas no período
 * @returns Dias de férias a que tem direito
 * 
 * @example
 * calcularDiasDireitoFerias(3)  // 30 dias
 * calcularDiasDireitoFerias(10) // 24 dias
 * calcularDiasDireitoFerias(35) // 0 dias (perdeu direito)
 */
export function calcularDiasDireitoFerias(faltas: number): number {
  for (const regra of TABELA_FALTAS_FERIAS) {
    if (faltas <= regra.faltasAte) {
      return regra.diasDireito
    }
  }
  return 0
}

// ============================================
// CÁLCULO DE VALORES
// ============================================

export interface ParametrosCalculoFerias {
  salario_base: number
  media_horas_extras?: number
  media_comissoes?: number
  media_adicional_noturno?: number
  media_periculosidade?: number
  media_insalubridade?: number
  outros_adicionais?: number
  dias_gozados: number
  dias_abono?: number
}

/**
 * Calcula todos os valores de férias
 * 
 * @param params - Parâmetros para o cálculo
 * @returns Objeto com todos os valores calculados
 * 
 * @example
 * const calculo = calcularValoresFerias({
 *   salario_base: 3000,
 *   media_horas_extras: 500,
 *   dias_gozados: 20,
 *   dias_abono: 10
 * })
 * // calculo.valor_total = valor das férias + 1/3 + abono + 1/3 abono
 */
export function calcularValoresFerias(params: ParametrosCalculoFerias): CalculoFerias {
  const {
    salario_base,
    media_horas_extras = 0,
    media_comissoes = 0,
    media_adicional_noturno = 0,
    media_periculosidade = 0,
    media_insalubridade = 0,
    outros_adicionais = 0,
    dias_gozados,
    dias_abono = 0,
  } = params
  
  // Base de cálculo (salário + médias de adicionais)
  const base_calculo = 
    salario_base +
    media_horas_extras +
    media_comissoes +
    media_adicional_noturno +
    media_periculosidade +
    media_insalubridade +
    outros_adicionais
  
  // Valor diário
  const valor_diario = base_calculo / 30
  
  // Férias (proporcional aos dias)
  const valor_ferias = valor_diario * dias_gozados
  const valor_terco = valor_ferias / 3
  
  // Abono pecuniário (dias vendidos)
  const valor_abono = valor_diario * dias_abono
  const valor_terco_abono = valor_abono / 3
  
  // Total bruto
  const valor_total = valor_ferias + valor_terco + valor_abono + valor_terco_abono
  
  return {
    salario_base,
    media_horas_extras,
    media_comissoes,
    media_adicional_noturno,
    media_periculosidade,
    media_insalubridade,
    outros_adicionais,
    base_calculo,
    dias_gozados,
    valor_ferias,
    valor_terco,
    dias_abono,
    valor_abono,
    valor_terco_abono,
    valor_total,
  }
}

// ============================================
// CÁLCULOS DE DATAS
// ============================================

/**
 * Calcula a data fim do período aquisitivo
 * 
 * @param dataInicio - Data de início do período
 * @returns Data fim (12 meses depois - 1 dia)
 */
export function calcularFimPeriodoAquisitivo(dataInicio: Date | string): Date {
  const inicio = typeof dataInicio === 'string' ? new Date(dataInicio) : dataInicio
  const fim = new Date(inicio)
  fim.setFullYear(fim.getFullYear() + 1)
  fim.setDate(fim.getDate() - 1)
  return fim
}

/**
 * Calcula a data limite de concessão
 * 
 * @param dataFimAquisitivo - Data fim do período aquisitivo
 * @returns Data limite (12 meses após o fim do aquisitivo)
 */
export function calcularLimiteConcessao(dataFimAquisitivo: Date | string): Date {
  const fim = typeof dataFimAquisitivo === 'string' ? new Date(dataFimAquisitivo) : dataFimAquisitivo
  const limite = new Date(fim)
  limite.setFullYear(limite.getFullYear() + 1)
  return limite
}

/**
 * Calcula quantos dias faltam para o vencimento
 * 
 * @param dataLimite - Data limite de concessão
 * @returns Número de dias (negativo se já venceu)
 */
export function calcularDiasParaVencer(dataLimite: Date | string): number {
  const limite = typeof dataLimite === 'string' ? new Date(dataLimite) : dataLimite
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  limite.setHours(0, 0, 0, 0)
  
  const diffMs = limite.getTime() - hoje.getTime()
  return Math.floor(diffMs / (1000 * 60 * 60 * 24))
}

/**
 * Calcula a data fim das férias baseado na data início e dias
 * 
 * @param dataInicio - Data de início das férias
 * @param dias - Número de dias de férias
 * @returns Data fim das férias
 */
export function calcularFimFerias(dataInicio: Date | string, dias: number): Date {
  const inicio = typeof dataInicio === 'string' ? new Date(dataInicio) : dataInicio
  const fim = new Date(inicio)
  fim.setDate(fim.getDate() + dias - 1) // -1 porque o dia início conta
  return fim
}

/**
 * Calcula número de dias entre duas datas (inclusive)
 * 
 * @param dataInicio - Data inicial
 * @param dataFim - Data final
 * @returns Número de dias
 */
export function calcularDiasEntreDatas(dataInicio: Date | string, dataFim: Date | string): number {
  const inicio = typeof dataInicio === 'string' ? new Date(dataInicio) : dataInicio
  const fim = typeof dataFim === 'string' ? new Date(dataFim) : dataFim
  
  inicio.setHours(0, 0, 0, 0)
  fim.setHours(0, 0, 0, 0)
  
  const diffMs = fim.getTime() - inicio.getTime()
  return Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1 // +1 para incluir ambos os dias
}

// ============================================
// CÁLCULOS DE SALDO
// ============================================

/**
 * Calcula o saldo disponível de um período
 * 
 * @param diasDireito - Dias de direito total
 * @param diasGozados - Dias já utilizados
 * @param diasVendidos - Dias vendidos (abono)
 * @param diasProgramados - Dias já agendados
 * @returns Saldo disponível
 */
export function calcularSaldoPeriodo(
  diasDireito: number,
  diasGozados: number,
  diasVendidos: number,
  diasProgramados: number = 0
): number {
  return diasDireito - diasGozados - diasVendidos - diasProgramados
}

/**
 * Calcula o saldo de dias acumulados (em aquisição)
 * 
 * @param dataAdmissao - Data de admissão
 * @param dataReferencia - Data para cálculo (default: hoje)
 * @returns Objeto com dias acumulados e fração
 */
export function calcularDiasAcumulados(
  dataAdmissao: Date | string,
  dataReferencia: Date = new Date()
): { mesesCompletos: number; diasAcumulados: number } {
  const admissao = typeof dataAdmissao === 'string' ? new Date(dataAdmissao) : dataAdmissao
  
  // Calcular meses completos
  let mesesCompletos = 0
  const dataCalculo = new Date(admissao)
  
  while (dataCalculo <= dataReferencia) {
    dataCalculo.setMonth(dataCalculo.getMonth() + 1)
    if (dataCalculo <= dataReferencia) {
      mesesCompletos++
    }
  }
  
  // Máximo 12 meses por período
  mesesCompletos = Math.min(mesesCompletos, 12)
  
  // 2.5 dias por mês
  const diasAcumulados = mesesCompletos * 2.5
  
  return {
    mesesCompletos,
    diasAcumulados,
  }
}