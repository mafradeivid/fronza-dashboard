// ============================================
// UTILS: CÁLCULO DE 13º SALÁRIO PROPORCIONAL
// Baseado na Lei 4.090/62 e CLT
// ============================================

import { Resultado13Salario } from '@/types/calculo'
import { calcularMesesNoAno } from './diasMes'

/**
 * Arredonda valor para 2 casas decimais
 */
function arredondar(valor: number): number {
  return Math.round(valor * 100) / 100
}

/**
 * Calcula 13º salário proporcional
 * 
 * Fórmula: (Salário / 12) * meses trabalhados no ano
 * 
 * Regra: Trabalhou 15 dias ou mais no mês = conta como mês cheio
 * 
 * Exemplo: Salário R$ 3.000, demitido em agosto (8 meses)
 * - 13º proporcional: (3000 / 12) * 8 = R$ 2.000
 */
export function calcular13Proporcional(
  salario_base: number,
  data_admissao: string,
  data_referencia: string
): Resultado13Salario {
  const mesesNoAno = calcularMesesNoAno(data_admissao, data_referencia)
  
  const valorPorMes = salario_base / 12
  const valorProporcional = valorPorMes * mesesNoAno
  
  return {
    valor_proporcional: arredondar(valorProporcional),
    dias_trabalhados: 0,
    dias_mes: 0,
    divisor_usado: 12,
    valor_diario: arredondar(valorPorMes),
    metodo: 'dias_reais',
    meses_ano: mesesNoAno,
  }
}

/**
 * Calcula 13º por quantidade específica de meses
 */
export function calcular13PorMeses(
  salario_base: number,
  meses: number
): Resultado13Salario {
  const mesesValidos = Math.min(Math.max(0, meses), 12)
  const valorPorMes = salario_base / 12
  const valorProporcional = valorPorMes * mesesValidos
  
  return {
    valor_proporcional: arredondar(valorProporcional),
    dias_trabalhados: 0,
    dias_mes: 0,
    divisor_usado: 12,
    valor_diario: arredondar(valorPorMes),
    metodo: 'dias_reais',
    meses_ano: mesesValidos,
  }
}

/**
 * Calcula 1ª parcela do 13º (adiantamento)
 * Paga até 30/11 - equivale a 50% do salário
 */
export function calcular13PrimeiraParcela(
  salario_base: number
): number {
  return arredondar(salario_base / 2)
}

/**
 * Calcula 2ª parcela do 13º
 * Paga até 20/12 - salário integral menos 1ª parcela e INSS
 */
export function calcular13SegundaParcela(
  salario_base: number,
  primeira_parcela: number,
  inss: number = 0
): number {
  return arredondar(salario_base - primeira_parcela - inss)
}

/**
 * Calcula 13º integral (12 meses)
 */
export function calcular13Integral(
  salario_base: number
): Resultado13Salario {
  return {
    valor_proporcional: salario_base,
    dias_trabalhados: 0,
    dias_mes: 0,
    divisor_usado: 12,
    valor_diario: arredondar(salario_base / 12),
    metodo: 'dias_reais',
    meses_ano: 12,
  }
}