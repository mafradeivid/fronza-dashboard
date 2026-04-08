// ============================================
// CÁLCULO DE ENCARGOS
// Recebe salário já proporcional
// ============================================

import { Funcionario } from '@/types/pessoas'
import { EncargosCalculados, DadosProporcionalidade, Competencia } from './types'
import { ALIQUOTA_FGTS, MESES_ANO } from './constantesCusto'
import { calcularProporcionalidade } from './calculoProporcional'

/**
 * Calcula encargos de um funcionário para uma competência
 * Aplica proporcionalidade automaticamente
 */
export function calcularEncargosFuncionario(
  funcionario: Funcionario,
  competencia: Competencia
): EncargosCalculados {
  // Calcular proporcionalidade
  const prop = calcularProporcionalidade(funcionario, competencia)
  
  // Se não está ativo, retorna zerado
  if (!prop.ativo) {
    return criarEncargosZerados(funcionario, prop)
  }
  
  const salarioBase = Number(funcionario.salario) || 0
  const salarioProp = prop.salarioProporcional
  const outrosProventos = Number(funcionario.outros_proventos) || 0
  
  // Alíquotas da empresa
  const aliquotaINSS = (Number(funcionario.empresa?.aliquota_inss) || 0) / 100
  const aliquotaRescisao = (Number(funcionario.empresa?.aliquota_provisao_rescisao) || 0) / 100

  // === ENCARGOS MENSAIS (sobre salário proporcional) ===
  const fgts = salarioProp * ALIQUOTA_FGTS
  const inssPatronal = salarioProp * aliquotaINSS
  const totalEncargos = fgts + inssPatronal

  // === PROVISÕES (também proporcionais) ===
  // 13º = salário proporcional / 12
  const decimoTerceiro = salarioProp / MESES_ANO
  const fgts13 = decimoTerceiro * ALIQUOTA_FGTS
  const inss13 = decimoTerceiro * aliquotaINSS
  const provisao13 = decimoTerceiro + fgts13 + inss13

  // Férias = salário proporcional / 12
  const ferias = salarioProp / MESES_ANO
  const fgtsFerias = ferias * ALIQUOTA_FGTS
  const inssFerias = ferias * aliquotaINSS
  const provisaoFerias = ferias + fgtsFerias + inssFerias

  // 1/3 de Férias
  const tercoFerias = ferias / 3
  const fgtsTerco = tercoFerias * ALIQUOTA_FGTS
  const inssTerco = tercoFerias * aliquotaINSS
  const provisao13Ferias = tercoFerias + fgtsTerco + inssTerco

  // Provisão Rescisão (sobre salário proporcional)
  const provisaoRescisao = salarioProp * aliquotaRescisao

  const totalProvisoes = provisao13 + provisaoFerias + provisao13Ferias + provisaoRescisao

  // === CUSTO TOTAL ===
  const custoTotal = salarioProp + outrosProventos + totalEncargos + totalProvisoes

  return {
    salarioBase,
    salarioProporcional: arredondar(salarioProp),
    outrosProventos,
    fgts: arredondar(fgts),
    inssPatronal: arredondar(inssPatronal),
    totalEncargos: arredondar(totalEncargos),
    provisao13: arredondar(provisao13),
    provisaoFerias: arredondar(provisaoFerias),
    provisao13Ferias: arredondar(provisao13Ferias),
    provisaoRescisao: arredondar(provisaoRescisao),
    totalProvisoes: arredondar(totalProvisoes),
    custoTotal: arredondar(custoTotal),
    proporcionalidade: prop,
  }
}

/**
 * Cria objeto de encargos zerado
 */
function criarEncargosZerados(
  funcionario: Funcionario,
  prop: DadosProporcionalidade
): EncargosCalculados {
  return {
    salarioBase: Number(funcionario.salario) || 0,
    salarioProporcional: 0,
    outrosProventos: 0,
    fgts: 0,
    inssPatronal: 0,
    totalEncargos: 0,
    provisao13: 0,
    provisaoFerias: 0,
    provisao13Ferias: 0,
    provisaoRescisao: 0,
    totalProvisoes: 0,
    custoTotal: 0,
    proporcionalidade: prop,
  }
}

/**
 * Arredonda para 2 casas decimais
 */
function arredondar(valor: number): number {
  return Math.round(valor * 100) / 100
}