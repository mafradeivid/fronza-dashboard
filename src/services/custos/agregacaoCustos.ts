// ============================================
// AGREGAÇÃO DE CUSTOS
// Agrupa por empresa, setor, funcionário
// ============================================

import { ResumoCusto, ResumoCustoCompleto } from '@/types/custoPessoal'
import { EncargosCalculados } from './types'

/**
 * Cria resumo vazio
 */
export function criarResumoVazio(): ResumoCusto {
  return {
    salarios: 0,
    outrosProventos: 0,
    fgts: 0,
    inssPatronal: 0,
    provisao13: 0,
    provisaoFerias: 0,
    provisao13Ferias: 0,
    provisaoRescisao: 0,
    pagamentosExtras: 0,
  }
}

/**
 * Converte EncargosCalculados para ResumoCusto
 */
export function encargosParaResumo(encargos: EncargosCalculados): ResumoCusto {
  return {
    salarios: encargos.salarioProporcional,
    outrosProventos: encargos.outrosProventos,
    fgts: encargos.fgts,
    inssPatronal: encargos.inssPatronal,
    provisao13: encargos.provisao13,
    provisaoFerias: encargos.provisaoFerias,
    provisao13Ferias: encargos.provisao13Ferias,
    provisaoRescisao: encargos.provisaoRescisao,
    pagamentosExtras: 0,
  }
}

/**
 * Soma dois resumos
 */
export function somarResumos(a: ResumoCusto, b: ResumoCusto): ResumoCusto {
  return {
    salarios: a.salarios + b.salarios,
    outrosProventos: a.outrosProventos + b.outrosProventos,
    fgts: a.fgts + b.fgts,
    inssPatronal: a.inssPatronal + b.inssPatronal,
    provisao13: a.provisao13 + b.provisao13,
    provisaoFerias: a.provisaoFerias + b.provisaoFerias,
    provisao13Ferias: a.provisao13Ferias + b.provisao13Ferias,
    provisaoRescisao: a.provisaoRescisao + b.provisaoRescisao,
    pagamentosExtras: a.pagamentosExtras + b.pagamentosExtras,
  }
}

/**
 * Calcula totais do resumo
 */
export function calcularTotais(resumo: ResumoCusto): ResumoCustoCompleto {
  const totalEncargos = resumo.fgts + resumo.inssPatronal
  const totalProvisoes = 
    resumo.provisao13 + 
    resumo.provisaoFerias + 
    resumo.provisao13Ferias + 
    resumo.provisaoRescisao
  
  const custoTotal = 
    resumo.salarios + 
    resumo.outrosProventos + 
    totalEncargos + 
    totalProvisoes + 
    resumo.pagamentosExtras

  return {
    ...resumo,
    totalEncargos: arredondar(totalEncargos),
    totalProvisoes: arredondar(totalProvisoes),
    custoTotal: arredondar(custoTotal),
  }
}

/**
 * Calcula variação percentual entre dois valores
 */
export function calcularVariacao(atual: number, anterior: number | null): number | null {
  if (anterior === null || anterior === 0) return null
  return ((atual - anterior) / anterior) * 100
}

/**
 * Ordena array por custoTotal decrescente
 */
export function ordenarPorCusto<T extends { custoTotal: number }>(array: T[]): T[] {
  return [...array].sort((a, b) => b.custoTotal - a.custoTotal)
}

/**
 * Calcula percentual do total
 */
export function calcularPercentual(valor: number, total: number): number {
  if (total === 0) return 0
  return (valor / total) * 100
}

/**
 * Arredonda para 2 casas decimais
 */
function arredondar(valor: number): number {
  return Math.round(valor * 100) / 100
}