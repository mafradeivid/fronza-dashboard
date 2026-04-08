// ============================================
// CÁLCULO DE PROPORCIONALIDADE
// Integra com utils/calculo para dias
// ============================================

import { Funcionario } from '@/types/pessoas'
import { DadosProporcionalidade, Competencia } from './types'
import { diasNoMes } from '@/utils/calculo'

/**
 * Verifica se funcionário estava ativo na competência
 */
export function funcionarioAtivoNaCompetencia(
  funcionario: Funcionario,
  competencia: Competencia
): boolean {
  const { mes, ano } = competencia
  
  // Primeiro dia da competência
  const primeiroDia = new Date(ano, mes - 1, 1)
  // Último dia da competência
  const ultimoDia = new Date(ano, mes, 0)
  
  // Data de admissão
  const admissao = new Date(funcionario.admissao + 'T00:00:00')
  
  // Se admissão é depois do último dia da competência, não conta
  if (admissao > ultimoDia) {
    return false
  }
  
  // Se tem data_ultimo_dia (demitido), verificar
  if (funcionario.data_ultimo_dia) {
    const ultimoDiaTrabalho = new Date(funcionario.data_ultimo_dia + 'T00:00:00')
    // Se último dia de trabalho é antes do primeiro dia da competência, não conta
    if (ultimoDiaTrabalho < primeiroDia) {
      return false
    }
  }
  
  // Se status é inativo e não tem data_ultimo_dia dentro da competência
  if (funcionario.status === 'inativo' && !funcionario.data_ultimo_dia) {
    return false
  }
  
  return true
}

/**
 * Calcula proporcionalidade do funcionário na competência
 */
export function calcularProporcionalidade(
  funcionario: Funcionario,
  competencia: Competencia
): DadosProporcionalidade {
  const { mes, ano } = competencia
  const salario = Number(funcionario.salario) || 0
  const totalDiasMes = diasNoMes(ano, mes)
  
  // Verifica se está ativo
  if (!funcionarioAtivoNaCompetencia(funcionario, competencia)) {
    return {
      diasTrabalhados: 0,
      diasMes: totalDiasMes,
      fatorProporcional: 0,
      salarioProporcional: 0,
      ativo: false,
      motivo: 'inativo',
    }
  }
  
  // Datas de referência
  
  const admissao = new Date(funcionario.admissao + 'T00:00:00')
  
  let diaInicio = 1
  let diaFim = totalDiasMes
  let motivo: 'mes_cheio' | 'admissao' | 'demissao' = 'mes_cheio'
  
  // Se admitido neste mês
  if (
    admissao.getFullYear() === ano &&
    admissao.getMonth() + 1 === mes
  ) {
    diaInicio = admissao.getDate()
    motivo = 'admissao'
  }
  
  // Se demitido neste mês
  if (funcionario.data_ultimo_dia) {
    const ultimoDiaTrabalho = new Date(funcionario.data_ultimo_dia + 'T00:00:00')
    if (
      ultimoDiaTrabalho.getFullYear() === ano &&
      ultimoDiaTrabalho.getMonth() + 1 === mes
    ) {
      diaFim = ultimoDiaTrabalho.getDate()
      motivo = motivo === 'admissao' ? 'admissao' : 'demissao'
    }
  }
  
  // Calcular dias trabalhados
  const diasTrabalhados = diaFim - diaInicio + 1
  const fatorProporcional = diasTrabalhados / totalDiasMes
  const salarioProporcional = salario * fatorProporcional
  
  return {
    diasTrabalhados,
    diasMes: totalDiasMes,
    fatorProporcional: Math.round(fatorProporcional * 10000) / 10000, // 4 casas
    salarioProporcional: Math.round(salarioProporcional * 100) / 100,
    ativo: true,
    motivo,
  }
}

/**
 * Gera lista de competências entre duas datas
 */
export function gerarCompetencias(
  mesInicio: number,
  anoInicio: number,
  mesFim: number,
  anoFim: number
): Competencia[] {
  const competencias: Competencia[] = []
  
  let mes = mesInicio
  let ano = anoInicio
  
  while (ano < anoFim || (ano === anoFim && mes <= mesFim)) {
    competencias.push({
      mes,
      ano,
      label: `${String(mes).padStart(2, '0')}/${ano}`,
    })
    
    mes++
    if (mes > 12) {
      mes = 1
      ano++
    }
  }
  
  return competencias
}

/**
 * Retorna nome do mês
 */
export function getNomeMes(mes: number): string {
  const nomes = [
    '', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]
  return nomes[mes] || ''
}