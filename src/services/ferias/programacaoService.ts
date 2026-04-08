// ============================================
// SERVICE: PROGRAMAÇÃO DE FÉRIAS
// ============================================

import { supabase } from '@/lib/supabase'
import { 
  PeriodoParaProgramacao, 
  DadosProgramacao, 
  CalculoProgramacao,
  FiltrosProgramacao,
  SituacaoPeriodo,
  FeriasCalendarioItem,
  EstatisticasProgramacao,
  ValidacaoProgramacao,
  SITUACAO_CONFIG,
  FERIAS_CONFIG,
} from '@/types/ferias'

// ============================================
// LISTAR PERÍODOS PARA PROGRAMAÇÃO
// ============================================

export async function listarPeriodosParaProgramacao(
  filtros: FiltrosProgramacao
): Promise<PeriodoParaProgramacao[]> {
  const hoje = new Date()

  // Query base
  let query = supabase
    .from('periodos_aquisitivos')
    .select(`
      *,
      funcionario:funcionarios!inner(
        id,
        nome_completo,
        matricula,
        empresa_id,
        salario,
        status,
        empresa:empresas(id, razao_social)
      )
    `)
    .eq('funcionario.status', 'ativo')
    .order('data_limite_concessao', { ascending: true })

  // Filtro por empresa
  if (filtros.empresa_id) {
    query = query.eq('funcionario.empresa_id', filtros.empresa_id)
  }

  const { data, error } = await query

  if (error) throw error

  // Processar e calcular situação
  const periodos: PeriodoParaProgramacao[] = (data || [])
    .map(p => {
      const func = p.funcionario as { 
        id: number
        nome_completo: string
        matricula: string | null
        empresa_id: number
        salario: number
        status: string
        empresa: { id: number; razao_social: string } | null
      }
      
      const saldo = p.dias_direito - p.dias_gozados - p.dias_vendidos
      const dataLimite = new Date(p.data_limite_concessao)
      const diasParaLimite = Math.ceil(
        (dataLimite.getTime() - hoje.getTime()) / (24 * 60 * 60 * 1000)
      )

      // Calcular situação
      const situacao = calcularSituacao(saldo, diasParaLimite, p.status)

      return {
        id: p.id,
        funcionario_id: func.id,
        funcionario_nome: func.nome_completo,
        funcionario_matricula: func.matricula || undefined,
        empresa_id: func.empresa_id,
        empresa_nome: func.empresa?.razao_social || '',
        salario: Number(func.salario) || 0,
        numero: p.numero,
        data_inicio: p.data_inicio,
        data_fim: p.data_fim,
        data_limite: p.data_limite_concessao,
        data_limite_concessao: p.data_limite_concessao,
        dias_direito: p.dias_direito,
        dias_gozados: p.dias_gozados,
        dias_vendidos: p.dias_vendidos,
        saldo,
        situacao,
        status: p.status,
        dias_para_limite: diasParaLimite,
      }
    })
    // Filtrar por situação
    .filter(p => {
      if (filtros.situacao && filtros.situacao !== 'todos') {
        return p.situacao === filtros.situacao
      }
      // Por padrão, não mostrar quitados
      return p.situacao !== 'quitado'
    })
    // Filtrar por busca
    .filter(p => {
      if (!filtros.busca) return true
      const termo = filtros.busca.toLowerCase()
      return p.funcionario_nome.toLowerCase().includes(termo) ||
             p.funcionario_matricula?.toLowerCase().includes(termo)
    })
    // Ordenar por urgência
    .sort((a, b) => {
      return SITUACAO_CONFIG[a.situacao].ordem - SITUACAO_CONFIG[b.situacao].ordem
    })

  return periodos
}

// ============================================
// CALCULAR SITUAÇÃO DO PERÍODO
// ============================================

function calcularSituacao(
  saldo: number, 
  diasParaLimite: number, 
  statusBanco: string
): SituacaoPeriodo {
  if (saldo <= 0) {
    return 'quitado'
  }
  
  if (statusBanco === 'vencido' || diasParaLimite < 0) {
    return 'vencido'
  }
  
  if (statusBanco === 'em_aquisicao') {
    return 'em_aquisicao'
  }
  
  if (diasParaLimite < FERIAS_CONFIG.DIAS_LIMITE_CRITICO) {
    return 'critico'
  }
  
  if (diasParaLimite < FERIAS_CONFIG.DIAS_LIMITE_ATENCAO) {
    return 'atencao'
  }
  
  return 'normal'
}

// ============================================
// CALCULAR VALORES DAS FÉRIAS
// ============================================

export function calcularProgramacao(
  salario: number,
  diasGozo: number,
  diasAbono: number,
  dataInicio: string,
  saldoAtual: number
): CalculoProgramacao {
  // Salário diário (salário / 30)
  const salarioDia = salario / 30

  // Valor das férias
  const valorFerias = salarioDia * diasGozo
  const valorTerco = valorFerias / 3

  // Valor do abono
  const valorAbono = salarioDia * diasAbono
  const valorTercoAbono = valorAbono / 3

  // Total
  const valorTotal = valorFerias + valorTerco + valorAbono + valorTercoAbono

  // Datas
  const inicio = new Date(dataInicio + 'T00:00:00')
  
  // Data fim = início + dias - 1
  const fim = new Date(inicio)
  fim.setDate(fim.getDate() + diasGozo - 1)
  
  // Data retorno = fim + 1
  const retorno = new Date(fim)
  retorno.setDate(retorno.getDate() + 1)
  
  // Pagamento = 2 dias antes (CLT)
  const pagamento = new Date(inicio)
  pagamento.setDate(pagamento.getDate() - FERIAS_CONFIG.DIAS_ANTECEDENCIA_PAGAMENTO)

  return {
    dias_gozo: diasGozo,
    dias_abono: diasAbono,
    data_inicio: dataInicio,
    data_fim: fim.toISOString().split('T')[0],
    data_retorno: retorno.toISOString().split('T')[0],
    data_pagamento: pagamento.toISOString().split('T')[0],
    salario_dia: salarioDia,
    valor_ferias: valorFerias,
    valor_terco: valorTerco,
    valor_abono: valorAbono,
    valor_terco_abono: valorTercoAbono,
    valor_total: valorTotal,
    saldo_antes: saldoAtual,
    saldo_depois: saldoAtual - diasGozo - diasAbono,
  }
}

// ============================================
// VALIDAR PROGRAMAÇÃO
// ============================================

export function validarProgramacao(
  diasGozo: number,
  diasAbono: number,
  saldo: number,
  parcelasUsadas: number
): ValidacaoProgramacao {
  const erros: string[] = []

  // Mínimo de dias
  if (diasGozo < FERIAS_CONFIG.DIAS_MINIMO_PARCELA) {
    erros.push(`Mínimo de ${FERIAS_CONFIG.DIAS_MINIMO_PARCELA} dias de gozo (CLT Art. 134)`)
  }

  // Máximo de abono
  if (diasAbono > FERIAS_CONFIG.DIAS_MAXIMO_ABONO) {
    erros.push(`Máximo de ${FERIAS_CONFIG.DIAS_MAXIMO_ABONO} dias de abono pecuniário`)
  }

  // Saldo suficiente
  const totalDias = diasGozo + diasAbono
  if (totalDias > saldo) {
    erros.push(`Saldo insuficiente. Disponível: ${saldo} dias, solicitado: ${totalDias} dias`)
  }

  // Parcelas máximas
  if (parcelasUsadas >= FERIAS_CONFIG.PARCELAS_MAXIMAS) {
    erros.push(`Limite de ${FERIAS_CONFIG.PARCELAS_MAXIMAS} parcelas por período já atingido`)
  }

  return {
    valido: erros.length === 0,
    erros,
  }
}

// ============================================
// CONTAR PARCELAS USADAS NO PERÍODO
// ============================================

export async function contarParcelasPeriodo(periodoId: number): Promise<number> {
  const { count, error } = await supabase
    .from('lancamentos_ferias')
    .select('*', { count: 'exact', head: true })
    .eq('periodo_aquisitivo_id', periodoId)
    .neq('status', 'cancelado')

  if (error) throw error
  return count || 0
}

// ============================================
// SALVAR PROGRAMAÇÃO DE FÉRIAS
// ============================================

export async function salvarProgramacao(
  dados: DadosProgramacao
): Promise<{ id: number; calculo: CalculoProgramacao }> {
  // Buscar período
  const { data: periodo, error: erroPeriodo } = await supabase
    .from('periodos_aquisitivos')
    .select(`
      *,
      funcionario:funcionarios(salario)
    `)
    .eq('id', dados.periodo_id)
    .single()

  if (erroPeriodo || !periodo) {
    throw new Error('Período não encontrado')
  }

  const func = periodo.funcionario as { salario: number } | null
  const saldo = periodo.dias_direito - periodo.dias_gozados - periodo.dias_vendidos
  const salario = Number(func?.salario) || 0

  // Contar parcelas usadas
  const parcelasUsadas = await contarParcelasPeriodo(dados.periodo_id)

  // Validar
  const validacao = validarProgramacao(
    dados.dias_gozo,
    dados.dias_abono,
    saldo,
    parcelasUsadas
  )

  if (!validacao.valido) {
    throw new Error(validacao.erros.join('. '))
  }

  // Calcular valores
  const calculo = calcularProgramacao(
    salario,
    dados.dias_gozo,
    dados.dias_abono,
    dados.data_inicio,
    saldo
  )

  // Inserir lançamento
  const { data: lancamento, error: erroLancamento } = await supabase
    .from('lancamentos_ferias')
    .insert({
      periodo_aquisitivo_id: dados.periodo_id,
      funcionario_id: dados.funcionario_id,
      data_inicio: dados.data_inicio,
      data_fim: calculo.data_fim,
      dias_gozados: dados.dias_gozo,
      dias_abono: dados.dias_abono,
      parcela: parcelasUsadas + 1,
      salario_base: salario,
      base_calculo: salario,
      valor_ferias: calculo.valor_ferias,
      valor_terco: calculo.valor_terco,
      valor_abono: calculo.valor_abono,
      valor_terco_abono: calculo.valor_terco_abono,
      valor_total: calculo.valor_total,
      status: 'programado',
    })
    .select('id')
    .single()

  if (erroLancamento) throw erroLancamento

  // Atualizar período
  const novoSaldo = saldo - dados.dias_gozo - dados.dias_abono
  const novoStatus = novoSaldo <= 0 ? 'quitado' : 'parcial'

  const { error: erroUpdate } = await supabase
    .from('periodos_aquisitivos')
    .update({
      dias_gozados: periodo.dias_gozados + dados.dias_gozo,
      dias_vendidos: periodo.dias_vendidos + dados.dias_abono,
      status: novoStatus,
      updated_at: new Date().toISOString(),
    })
    .eq('id', dados.periodo_id)

  if (erroUpdate) throw erroUpdate

  return { id: lancamento.id, calculo }
}

// ============================================
// BUSCAR FÉRIAS PARA CALENDÁRIO
// ============================================

export async function buscarFeriasCalendarioMensal(
  mes: number,
  ano: number,
  empresaId?: number
): Promise<FeriasCalendarioItem[]> {
  const primeiroDia = `${ano}-${String(mes).padStart(2, '0')}-01`
  const ultimoDia = new Date(ano, mes, 0).toISOString().split('T')[0]

  let query = supabase
    .from('lancamentos_ferias')
    .select(`
      id,
      data_inicio,
      data_fim,
      dias_gozados,
      funcionario:funcionarios!inner(
        id,
        nome_completo,
        empresa_id
      )
    `)
    .in('status', ['programado', 'em_gozo'])
    .lte('data_inicio', ultimoDia)
    .gte('data_fim', primeiroDia)
    .order('data_inicio')

  if (empresaId) {
    query = query.eq('funcionario.empresa_id', empresaId)
  }

  const { data, error } = await query

  if (error) throw error

  // Cores para diferenciar funcionários
  const cores = ['#0D9488', '#0EA5E9', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981']

  return (data || []).map((l, index) => {
    // Supabase pode retornar objeto ou array dependendo da relação
    const funcData = l.funcionario
    const func = Array.isArray(funcData) ? funcData[0] : funcData
    
    return {
      id: l.id,
      funcionario_id: func?.id || 0,
      funcionario_nome: func?.nome_completo || '',
      data_inicio: l.data_inicio,
      data_fim: l.data_fim,
      dias: l.dias_gozados,
      cor: cores[index % cores.length],
    }
  })
}

// ============================================
// ESTATÍSTICAS PARA DASHBOARD
// ============================================

export async function buscarEstatisticasProgramacao(
  empresaId?: number
): Promise<EstatisticasProgramacao> {
  // Buscar períodos
  const periodos = await listarPeriodosParaProgramacao({ 
    empresa_id: empresaId,
    situacao: 'todos' 
  })

  // Filtrar apenas com saldo (não quitados)
  const periodosComSaldo = periodos.filter(p => p.situacao !== 'quitado')

  // Contar por situação
  const vencidos = periodosComSaldo.filter(p => p.situacao === 'vencido').length
  const criticos = periodosComSaldo.filter(p => p.situacao === 'critico').length
  const atencao = periodosComSaldo.filter(p => p.situacao === 'atencao').length

  // Funcionários únicos
  const funcionariosUnicos = new Set(periodosComSaldo.map(p => p.funcionario_id))

  // Programados este mês
  const hoje = new Date()
  const inicioMes = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-01`
  const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).toISOString().split('T')[0]

  const { count: programadosMes } = await supabase
    .from('lancamentos_ferias')
    .select('id', { count: 'exact', head: true })
    .gte('data_inicio', inicioMes)
    .lte('data_inicio', fimMes)
    .neq('status', 'cancelado')

  // Em férias hoje
  const hojeStr = hoje.toISOString().split('T')[0]
  
  const { count: emFeriasHoje } = await supabase
    .from('lancamentos_ferias')
    .select('id', { count: 'exact', head: true })
    .lte('data_inicio', hojeStr)
    .gte('data_fim', hojeStr)
    .in('status', ['programado', 'em_andamento'])

  return {
    total_funcionarios: funcionariosUnicos.size,
    vencidos,
    criticos,
    atencao,
    programados_mes: programadosMes || 0,
    em_ferias_hoje: emFeriasHoje || 0,
  }
}

// ============================================
// BUSCAR HISTÓRICO DE FÉRIAS
// ============================================

export async function buscarHistoricoFerias(
  filtros: {
    empresa_id?: number
    funcionario_id?: number
    ano?: number
  }
): Promise<{
  id: number
  funcionario_nome: string
  periodo_numero: number
  data_inicio: string
  data_fim: string
  dias_gozados: number
  dias_abono: number
  valor_total: number
  status: string
}[]> {
  let query = supabase
    .from('lancamentos_ferias')
    .select(`
      id,
      data_inicio,
      data_fim,
      dias_gozados,
      dias_abono,
      valor_total,
      status,
      funcionario:funcionarios!inner(
        id,
        nome_completo,
        empresa_id
      ),
      periodo:periodos_aquisitivos(numero)
    `)
    .eq('status', 'concluido')
    .order('data_fim', { ascending: false })

  if (filtros.empresa_id) {
    query = query.eq('funcionario.empresa_id', filtros.empresa_id)
  }

  if (filtros.funcionario_id) {
    query = query.eq('funcionario_id', filtros.funcionario_id)
  }

  if (filtros.ano) {
    query = query
      .gte('data_inicio', `${filtros.ano}-01-01`)
      .lte('data_inicio', `${filtros.ano}-12-31`)
  }

  const { data, error } = await query

  if (error) throw error

  return (data || []).map(l => {
    // Supabase pode retornar objeto ou array dependendo da relação
    const funcData = l.funcionario
    const func = Array.isArray(funcData) ? funcData[0] : funcData
    const perData = l.periodo
    const per = Array.isArray(perData) ? perData[0] : perData
    
    return {
      id: l.id,
      funcionario_nome: func?.nome_completo || '',
      periodo_numero: per?.numero || 0,
      data_inicio: l.data_inicio,
      data_fim: l.data_fim,
      dias_gozados: l.dias_gozados,
      dias_abono: l.dias_abono,
      valor_total: Number(l.valor_total) || 0,
      status: l.status,
    }
  })
}

// ============================================
// CANCELAR PROGRAMAÇÃO
// ============================================

export async function cancelarProgramacao(
  lancamentoId: number
): Promise<void> {
  // Buscar lançamento
  const { data: lancamento, error: erroLancamento } = await supabase
    .from('lancamentos_ferias')
    .select('periodo_aquisitivo_id, dias_gozados, dias_abono, status')
    .eq('id', lancamentoId)
    .single()

  if (erroLancamento || !lancamento) {
    throw new Error('Lançamento não encontrado')
  }

  if (lancamento.status !== 'programado') {
    throw new Error('Só é possível cancelar férias programadas (não iniciadas)')
  }

  // Buscar período para restaurar saldo
  const { data: periodo, error: erroPeriodo } = await supabase
    .from('periodos_aquisitivos')
    .select('dias_gozados, dias_vendidos')
    .eq('id', lancamento.periodo_aquisitivo_id)
    .single()

  if (erroPeriodo || !periodo) {
    throw new Error('Período não encontrado')
  }

  // Atualizar lançamento
  const { error: erroUpdate1 } = await supabase
    .from('lancamentos_ferias')
    .update({
      status: 'cancelado',
      updated_at: new Date().toISOString(),
    })
    .eq('id', lancamentoId)

  if (erroUpdate1) throw erroUpdate1

  // Restaurar saldo no período
  const { error: erroUpdate2 } = await supabase
    .from('periodos_aquisitivos')
    .update({
      dias_gozados: periodo.dias_gozados - lancamento.dias_gozados,
      dias_vendidos: periodo.dias_vendidos - lancamento.dias_abono,
      status: 'adquirido',
      updated_at: new Date().toISOString(),
    })
    .eq('id', lancamento.periodo_aquisitivo_id)

  if (erroUpdate2) throw erroUpdate2
}