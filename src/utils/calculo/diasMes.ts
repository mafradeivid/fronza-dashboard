// ============================================
// UTILS: CÁLCULO DE DIAS DO MÊS
// Baseado na CLT Art. 64
// ============================================

import { MetodoDivisor } from '@/types/calculo'
import { DIAS_MES_COMERCIAL } from '@/config/calculoConfig'

/**
 * Verifica se o ano é bissexto
 */
export function ehAnoBissexto(ano: number): boolean {
  return (ano % 4 === 0 && ano % 100 !== 0) || (ano % 400 === 0)
}

/**
 * Retorna a quantidade real de dias no mês
 */
export function diasNoMes(ano: number, mes: number): number {
  return new Date(ano, mes, 0).getDate()
}

/**
 * Retorna o divisor a ser usado no cálculo conforme o método configurado
 * 
 * @param ano - Ano de referência
 * @param mes - Mês de referência (1-12)
 * @param metodo - Método de divisor configurado
 * @param excecaoFevereiro - Se true, fevereiro usa dias reais mesmo no método 'sempre_30'
 */
export function obterDivisor(
  ano: number, 
  mes: number, 
  metodo: MetodoDivisor,
  excecaoFevereiro: boolean = true
): number {
  switch (metodo) {
    case 'dias_reais':
      return diasNoMes(ano, mes)
    
    case 'sempre_30':
      return DIAS_MES_COMERCIAL
    
    case 'comercial':
      // 30 dias, exceto fevereiro se excecaoFevereiro = true
      if (mes === 2 && excecaoFevereiro) {
        return diasNoMes(ano, mes)
      }
      return DIAS_MES_COMERCIAL
    
    default:
      return diasNoMes(ano, mes)
  }
}

/**
 * Calcula quantos dias foram trabalhados no mês
 * 
 * @param data - Data de referência (YYYY-MM-DD)
 * @param tipo - 'admissao' (conta até fim do mês) ou 'demissao' (conta do início até a data)
 * @param incluirDia - Se inclui o próprio dia no cálculo
 */
export function calcularDiasTrabalhados(
  data: string,
  tipo: 'admissao' | 'demissao',
  incluirDia: boolean = true
): number {
  const dataObj = new Date(data + 'T00:00:00')
  const dia = dataObj.getDate()
  const mes = dataObj.getMonth() + 1
  const ano = dataObj.getFullYear()
  const diasMes = diasNoMes(ano, mes)
  
  if (tipo === 'admissao') {
    // Da admissão até o fim do mês
    const diasAteOFim = diasMes - dia + (incluirDia ? 1 : 0)
    return Math.max(0, diasAteOFim)
  } else {
    // Do início do mês até a demissão
    const diasAteAData = dia + (incluirDia ? 0 : -1)
    return Math.max(0, diasAteAData)
  }
}

/**
 * Calcula meses trabalhados entre duas datas
 * Usado para férias e 13º proporcionais
 * 
 * Regra: Se trabalhou 15 dias ou mais no mês, conta como mês inteiro
 */
export function calcularMesesTrabalhados(
  dataAdmissao: string,
  dataReferencia: string
): number {
  const admissao = new Date(dataAdmissao + 'T00:00:00')
  const referencia = new Date(dataReferencia + 'T00:00:00')
  
  const anos = referencia.getFullYear() - admissao.getFullYear()
  const meses = referencia.getMonth() - admissao.getMonth()
  const dias = referencia.getDate() - admissao.getDate()
  
  let totalMeses = anos * 12 + meses
  
  // Se trabalhou 15 dias ou mais no mês, conta como mês inteiro
  if (dias >= 15) {
    totalMeses += 1
  }
  
  return Math.max(0, totalMeses)
}

/**
 * Calcula meses trabalhados no ano corrente (para 13º)
 */
export function calcularMesesNoAno(
  dataAdmissao: string,
  dataReferencia: string
): number {
  const admissao = new Date(dataAdmissao + 'T00:00:00')
  const referencia = new Date(dataReferencia + 'T00:00:00')
  const anoReferencia = referencia.getFullYear()
  
  // Se admissão foi em ano anterior, começa do mês 1
  let mesInicio = 1
  if (admissao.getFullYear() === anoReferencia) {
    mesInicio = admissao.getMonth() + 1
    // Se entrou depois do dia 15, não conta o mês de admissão
    if (admissao.getDate() > 15) {
      mesInicio += 1
    }
  }
  
  const mesFim = referencia.getMonth() + 1
  
  return Math.max(0, Math.min(12, mesFim - mesInicio + 1))
}

/**
 * Extrai ano e mês de uma data string
 */
export function extrairAnoMes(data: string): { ano: number; mes: number } {
  const dataObj = new Date(data + 'T00:00:00')
  return {
    ano: dataObj.getFullYear(),
    mes: dataObj.getMonth() + 1,
  }
}