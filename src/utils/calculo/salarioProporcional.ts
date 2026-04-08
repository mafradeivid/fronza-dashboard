// ============================================
// UTILS: CÁLCULO DE SALÁRIO PROPORCIONAL
// Baseado na CLT Art. 64
// ============================================

import { 
  ConfigCalculo, 
  ResultadoCalculo,
  DadosCalculoAdmissao,
  DadosCalculoDemissao 
} from '@/types/calculo'
import { obterDivisor, calcularDiasTrabalhados, diasNoMes } from './diasMes'

/**
 * Arredonda valor para 2 casas decimais
 */
function arredondar(valor: number): number {
  return Math.round(valor * 100) / 100
}

/**
 * Calcula salário proporcional para admissão no meio do mês
 * 
 * Exemplo: Admitido dia 15/02, salário R$ 3.000
 * - Fevereiro tem 28 dias
 * - Dias trabalhados: 28 - 15 + 1 = 14 dias
 * - Valor: (3000 / 28) * 14 = R$ 1.500,00
 */
export function calcularSalarioAdmissao(
  dados: DadosCalculoAdmissao,
  config: ConfigCalculo
): ResultadoCalculo {
  const { salario_base, data_admissao, ano, mes } = dados
  
  const diasMes = diasNoMes(ano, mes)
  const divisor = obterDivisor(ano, mes, config.metodo_divisor, config.excecao_fevereiro)
  const diasTrabalhados = calcularDiasTrabalhados(
    data_admissao, 
    'admissao', 
    config.incluir_dia_admissao
  )
  
  const valorDiario = salario_base / divisor
  const valorProporcional = valorDiario * diasTrabalhados
  
  return {
    valor_proporcional: arredondar(valorProporcional),
    dias_trabalhados: diasTrabalhados,
    dias_mes: diasMes,
    divisor_usado: divisor,
    valor_diario: arredondar(valorDiario),
    metodo: config.metodo_divisor,
  }
}

/**
 * Calcula saldo de salário para demissão
 * 
 * Exemplo: Demitido dia 20/03, salário R$ 3.000
 * - Março tem 31 dias
 * - Dias trabalhados: 20 dias
 * - Valor: (3000 / 31) * 20 = R$ 1.935,48
 */
export function calcularSaldoSalario(
  dados: DadosCalculoDemissao,
  config: ConfigCalculo
): ResultadoCalculo {
  const { salario_base, data_demissao, ano, mes } = dados
  
  const diasMes = diasNoMes(ano, mes)
  const divisor = obterDivisor(ano, mes, config.metodo_divisor, config.excecao_fevereiro)
  const diasTrabalhados = calcularDiasTrabalhados(
    data_demissao, 
    'demissao', 
    config.incluir_dia_demissao
  )
  
  const valorDiario = salario_base / divisor
  const valorProporcional = valorDiario * diasTrabalhados
  
  return {
    valor_proporcional: arredondar(valorProporcional),
    dias_trabalhados: diasTrabalhados,
    dias_mes: diasMes,
    divisor_usado: divisor,
    valor_diario: arredondar(valorDiario),
    metodo: config.metodo_divisor,
  }
}

/**
 * Calcula valor de desconto por falta
 */
export function calcularDescontoFalta(
  salario_base: number,
  dias_falta: number,
  ano: number,
  mes: number,
  config: ConfigCalculo
): ResultadoCalculo {
  const diasMes = diasNoMes(ano, mes)
  const divisor = obterDivisor(ano, mes, config.metodo_divisor, config.excecao_fevereiro)
  
  const valorDiario = salario_base / divisor
  const valorDesconto = valorDiario * dias_falta
  
  return {
    valor_proporcional: arredondar(valorDesconto),
    dias_trabalhados: dias_falta,
    dias_mes: diasMes,
    divisor_usado: divisor,
    valor_diario: arredondar(valorDiario),
    metodo: config.metodo_divisor,
  }
}

/**
 * Calcula salário proporcional genérico
 * Útil para cálculos simples sem contexto de admissão/demissão
 */
export function calcularProporcional(
  salario_base: number,
  dias_trabalhados: number,
  ano: number,
  mes: number,
  config: ConfigCalculo
): ResultadoCalculo {
  const diasMes = diasNoMes(ano, mes)
  const divisor = obterDivisor(ano, mes, config.metodo_divisor, config.excecao_fevereiro)
  
  const valorDiario = salario_base / divisor
  const valorProporcional = valorDiario * dias_trabalhados
  
  return {
    valor_proporcional: arredondar(valorProporcional),
    dias_trabalhados,
    dias_mes: diasMes,
    divisor_usado: divisor,
    valor_diario: arredondar(valorDiario),
    metodo: config.metodo_divisor,
  }
}