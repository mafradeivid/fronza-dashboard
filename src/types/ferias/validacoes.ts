// ============================================
// VALIDAÇÕES: SISTEMA DE FÉRIAS
// ============================================

import { REGRAS_FRACIONAMENTO, REGRAS_ABONO } from './constantes'

// ============================================
// TIPOS DE RETORNO
// ============================================

export interface ResultadoValidacao {
  valido: boolean
  erro?: string
  avisos?: string[]
}

// ============================================
// VALIDAÇÃO DE FRACIONAMENTO
// ============================================

export interface ParcelaFerias {
  dias: number
  numero: number // 1, 2 ou 3
}

/**
 * Valida se o fracionamento das férias está correto (CLT Art. 134 §1º)
 * 
 * Regras:
 * - Máximo 3 parcelas
 * - 1ª parcela: mínimo 14 dias
 * - Demais parcelas: mínimo 5 dias cada
 * 
 * @param diasTotais - Total de dias de férias
 * @param parcelas - Array com as parcelas
 * @returns Resultado da validação
 * 
 * @example
 * validarFracionamento(30, [
 *   { numero: 1, dias: 14 },
 *   { numero: 2, dias: 10 },
 *   { numero: 3, dias: 6 }
 * ])
 */
export function validarFracionamento(
  diasTotais: number,
  parcelas: ParcelaFerias[]
): ResultadoValidacao {
  const avisos: string[] = []
  
  // Sem parcelas
  if (parcelas.length === 0) {
    return { valido: false, erro: 'É necessário informar ao menos uma parcela' }
  }
  
  // Máximo 3 parcelas
  if (parcelas.length > REGRAS_FRACIONAMENTO.maximoParcelas) {
    return { 
      valido: false, 
      erro: `Máximo de ${REGRAS_FRACIONAMENTO.maximoParcelas} parcelas permitidas` 
    }
  }
  
  // Verificar soma dos dias
  const somaDias = parcelas.reduce((acc, p) => acc + p.dias, 0)
  if (somaDias !== diasTotais) {
    return { 
      valido: false, 
      erro: `Soma das parcelas (${somaDias} dias) difere do total (${diasTotais} dias)` 
    }
  }
  
  // Verificar mínimos por parcela
  for (const parcela of parcelas) {
    const minimo = parcela.numero === 1 
      ? REGRAS_FRACIONAMENTO.minimoDiasPrimeiraParcela
      : REGRAS_FRACIONAMENTO.minimoDiasDemaisParcelas
    
    if (parcela.dias < minimo) {
      return { 
        valido: false, 
        erro: `A ${parcela.numero}ª parcela precisa ter no mínimo ${minimo} dias (tem ${parcela.dias})` 
      }
    }
  }
  
  // Avisos (não impeditivos)
  if (parcelas.length === 3) {
    avisos.push('Atingiu o máximo de parcelas permitidas')
  }
  
  return { valido: true, avisos: avisos.length > 0 ? avisos : undefined }
}

// ============================================
// VALIDAÇÃO DE ABONO PECUNIÁRIO
// ============================================

/**
 * Valida abono pecuniário (venda de férias) - CLT Art. 143
 * 
 * Regras:
 * - Máximo 10 dias (1/3 das férias)
 * - Não pode ser negativo
 * - Não pode ser maior que 1/3 do direito
 * 
 * @param diasAbono - Dias que deseja vender
 * @param diasDireito - Total de dias de direito
 * @returns Resultado da validação
 */
export function validarAbono(
  diasAbono: number,
  diasDireito: number
): ResultadoValidacao {
  if (diasAbono < 0) {
    return { valido: false, erro: 'Dias de abono não pode ser negativo' }
  }
  
  if (diasAbono === 0) {
    return { valido: true }
  }
  
  if (diasAbono > REGRAS_ABONO.maximoDias) {
    return { 
      valido: false, 
      erro: `Máximo de ${REGRAS_ABONO.maximoDias} dias de abono permitido` 
    }
  }
  
  const maximoPermitido = Math.floor(diasDireito / 3)
  if (diasAbono > maximoPermitido) {
    return { 
      valido: false, 
      erro: `Máximo de ${maximoPermitido} dias (1/3 do direito de ${diasDireito} dias)` 
    }
  }
  
  return { valido: true }
}

// ============================================
// VALIDAÇÃO DE DATAS
// ============================================

/**
 * Valida se as datas das férias são válidas
 * 
 * @param dataInicio - Data de início
 * @param dataFim - Data de fim
 * @param dataLimiteConcessao - Data limite para conceder
 * @returns Resultado da validação
 */
export function validarDatasFerias(
  dataInicio: string,
  dataFim: string,
  dataLimiteConcessao?: string
): ResultadoValidacao {
  const avisos: string[] = []
  const inicio = new Date(dataInicio)
  const fim = new Date(dataFim)
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  
  // Data fim deve ser após data início
  if (fim <= inicio) {
    return { valido: false, erro: 'Data fim deve ser posterior à data início' }
  }
  
  // Aviso se início no passado
  if (inicio < hoje) {
    avisos.push('Data de início está no passado')
  }
  
  // Validar contra limite de concessão
  if (dataLimiteConcessao) {
    const limite = new Date(dataLimiteConcessao)
    if (fim > limite) {
      return { 
        valido: false, 
        erro: `Férias devem terminar até ${limite.toLocaleDateString('pt-BR')} (limite de concessão)` 
      }
    }
  }
  
  // Aviso: férias não devem começar em domingo (CLT Art. 134 §3º)
  if (inicio.getDay() === 0) {
    avisos.push('Férias não podem iniciar em domingo (CLT Art. 134 §3º)')
    return { valido: false, erro: avisos[0] }
  }
  
  // Aviso: férias não devem começar em feriado
  // (Aqui precisaria de uma lista de feriados - simplificando)
  
  // Aviso: não iniciar 2 dias antes de feriado ou repouso semanal
  const diaSemana = inicio.getDay()
  if (diaSemana === 5 || diaSemana === 6) { // Sexta ou Sábado
    avisos.push('CLT Art. 134 §3º: férias não devem iniciar nos 2 dias antes do repouso semanal')
    return { valido: false, erro: avisos[0] }
  }
  
  return { valido: true, avisos: avisos.length > 0 ? avisos : undefined }
}

// ============================================
// VALIDAÇÃO DE PERÍODO
// ============================================

/**
 * Valida se um período pode receber lançamento de férias
 * 
 * @param status - Status atual do período
 * @param diasSaldo - Saldo disponível
 * @param diasSolicitados - Dias que deseja lançar
 * @returns Resultado da validação
 */
export function validarPeriodoParaLancamento(
  status: string,
  diasSaldo: number,
  diasSolicitados: number
): ResultadoValidacao {
  // Verificar status
  const statusPermitidos = ['adquirido', 'parcial']
  if (!statusPermitidos.includes(status)) {
    const mensagens: Record<string, string> = {
      em_aquisicao: 'Período ainda em aquisição (não completou 12 meses)',
      quitado: 'Período já quitado (todos os dias utilizados)',
      vencido: 'Período vencido (passou do prazo de concessão)',
    }
    return { 
      valido: false, 
      erro: mensagens[status] || `Status "${status}" não permite lançamento` 
    }
  }
  
  // Verificar saldo
  if (diasSaldo <= 0) {
    return { valido: false, erro: 'Período sem saldo de dias disponível' }
  }
  
  if (diasSolicitados > diasSaldo) {
    return { 
      valido: false, 
      erro: `Saldo insuficiente: solicitou ${diasSolicitados} dias, disponível ${diasSaldo} dias` 
    }
  }
  
  return { valido: true }
}

// ============================================
// VALIDAÇÃO COMPLETA DE LANÇAMENTO
// ============================================

export interface DadosValidacaoLancamento {
  periodo_status: string
  dias_saldo: number
  dias_gozados: number
  dias_abono: number
  data_inicio: string
  data_fim: string
  data_limite_concessao: string
  parcela: number
  parcelas_existentes: ParcelaFerias[]
}

/**
 * Validação completa de um novo lançamento de férias
 * 
 * @param dados - Todos os dados necessários para validação
 * @returns Resultado da validação
 */
export function validarLancamentoCompleto(
  dados: DadosValidacaoLancamento
): ResultadoValidacao {
  const erros: string[] = []
  const avisos: string[] = []
  
  // 1. Validar período
  const validacaoPeriodo = validarPeriodoParaLancamento(
    dados.periodo_status,
    dados.dias_saldo,
    dados.dias_gozados + dados.dias_abono
  )
  if (!validacaoPeriodo.valido) {
    erros.push(validacaoPeriodo.erro!)
  }
  
  // 2. Validar abono
  if (dados.dias_abono > 0) {
    const validacaoAbono = validarAbono(dados.dias_abono, dados.dias_saldo)
    if (!validacaoAbono.valido) {
      erros.push(validacaoAbono.erro!)
    }
  }
  
  // 3. Validar datas
  const validacaoDatas = validarDatasFerias(
    dados.data_inicio,
    dados.data_fim,
    dados.data_limite_concessao
  )
  if (!validacaoDatas.valido) {
    erros.push(validacaoDatas.erro!)
  }
  if (validacaoDatas.avisos) {
    avisos.push(...validacaoDatas.avisos)
  }
  
  // 4. Validar fracionamento (se houver parcelas anteriores)
  const todasParcelas = [
    ...dados.parcelas_existentes,
    { numero: dados.parcela, dias: dados.dias_gozados }
  ]
  
  if (todasParcelas.length > 1) {
    const totalDias = todasParcelas.reduce((acc, p) => acc + p.dias, 0) + dados.dias_abono
    const validacaoFracionamento = validarFracionamento(totalDias, todasParcelas)
    if (!validacaoFracionamento.valido) {
      erros.push(validacaoFracionamento.erro!)
    }
    if (validacaoFracionamento.avisos) {
      avisos.push(...validacaoFracionamento.avisos)
    }
  }
  
  // Retornar resultado
  if (erros.length > 0) {
    return { valido: false, erro: erros.join('; '), avisos }
  }
  
  return { valido: true, avisos: avisos.length > 0 ? avisos : undefined }
}