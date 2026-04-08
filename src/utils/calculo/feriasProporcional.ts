// ============================================
// UTILS: CÁLCULO DE FÉRIAS PROPORCIONAIS
// Baseado na CLT - Art. 146 e 147
// ============================================

import { ResultadoFerias } from '@/types/calculo'
import { PERCENTUAL_TERCO_FERIAS } from '@/config/calculoConfig'
import { calcularMesesTrabalhados } from './diasMes'

/**
 * Arredonda valor para 2 casas decimais
 */
function arredondar(valor: number): number {
  return Math.round(valor * 100) / 100
}

/**
 * Calcula férias proporcionais + 1/3 constitucional
 * 
 * Fórmula: (Salário / 12) * meses trabalhados + 1/3
 * 
 * Exemplo: Salário R$ 3.000, 8 meses trabalhados
 * - Férias proporcionais: (3000 / 12) * 8 = R$ 2.000
 * - 1/3 constitucional: 2000 / 3 = R$ 666,67
 * - Total: R$ 2.666,67
 */
export function calcularFeriasProporcionais(
  salario_base: number,
  data_admissao: string,
  data_demissao: string
): ResultadoFerias {
  const mesesTrabalhados = calcularMesesTrabalhados(data_admissao, data_demissao)
  
  // Férias proporcionais = (salário / 12) * meses trabalhados
  const valorPorMes = salario_base / 12
  const valorBase = valorPorMes * mesesTrabalhados
  const valorTerco = valorBase * PERCENTUAL_TERCO_FERIAS
  const valorTotal = valorBase + valorTerco
  
  return {
    valor_proporcional: arredondar(valorBase),
    dias_trabalhados: 0,
    dias_mes: 0,
    divisor_usado: 12,
    valor_diario: arredondar(valorPorMes),
    metodo: 'dias_reais',
    meses_direito: mesesTrabalhados,
    valor_terco: arredondar(valorTerco),
    valor_total: arredondar(valorTotal),
  }
}

/**
 * Calcula férias proporcionais por quantidade de meses específica
 * (sem precisar calcular meses entre datas)
 */
export function calcularFeriasPorMeses(
  salario_base: number,
  meses: number
): ResultadoFerias {
  const valorPorMes = salario_base / 12
  const valorBase = valorPorMes * Math.min(meses, 12)
  const valorTerco = valorBase * PERCENTUAL_TERCO_FERIAS
  const valorTotal = valorBase + valorTerco
  
  return {
    valor_proporcional: arredondar(valorBase),
    dias_trabalhados: 0,
    dias_mes: 0,
    divisor_usado: 12,
    valor_diario: arredondar(valorPorMes),
    metodo: 'dias_reais',
    meses_direito: Math.min(meses, 12),
    valor_terco: arredondar(valorTerco),
    valor_total: arredondar(valorTotal),
  }
}

/**
 * Calcula férias vencidas (período completo de 12 meses)
 * 
 * Valor: Salário + 1/3 constitucional
 */
export function calcularFeriasVencidas(
  salario_base: number
): { valor_base: number; valor_terco: number; valor_total: number } {
  const valorTerco = salario_base * PERCENTUAL_TERCO_FERIAS
  
  return {
    valor_base: salario_base,
    valor_terco: arredondar(valorTerco),
    valor_total: arredondar(salario_base + valorTerco),
  }
}

/**
 * Calcula férias em dobro (não gozadas no período concessivo)
 * CLT Art. 137
 */
export function calcularFeriasEmDobro(
  salario_base: number
): { valor_base: number; valor_terco: number; valor_total: number } {
  const valorBase = salario_base * 2
  const valorTerco = valorBase * PERCENTUAL_TERCO_FERIAS
  
  return {
    valor_base: valorBase,
    valor_terco: arredondar(valorTerco),
    valor_total: arredondar(valorBase + valorTerco),
  }
}

/**
 * Calcula abono pecuniário (venda de 1/3 das férias)
 * CLT Art. 143
 */
export function calcularAbonoPecuniario(
  salario_base: number
): { valor_abono: number; valor_terco_abono: number; total_abono: number } {
  // Abono = 10 dias de férias (1/3 de 30)
  const valorAbono = salario_base / 3
  const valorTercoAbono = valorAbono * PERCENTUAL_TERCO_FERIAS
  
  return {
    valor_abono: arredondar(valorAbono),
    valor_terco_abono: arredondar(valorTercoAbono),
    total_abono: arredondar(valorAbono + valorTercoAbono),
  }
}