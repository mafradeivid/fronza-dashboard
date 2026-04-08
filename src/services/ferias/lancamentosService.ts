// ============================================
// SERVICE: LANÇAMENTOS DE FÉRIAS
// ============================================

import { supabase } from '@/lib/supabase'
import { 
  LancamentoFerias,
  NovoLancamentoFerias,
  FiltrosLancamentos,
  StatusLancamento,
  calcularValoresFerias,
  validarLancamentoCompleto,
  ParcelaFerias,
} from '@/types/ferias'
import { atualizarDias,  } from './periodosService'

// ============================================
// LISTAGEM
// ============================================

/**
 * Lista lançamentos de férias com filtros
 */
export async function listarLancamentos(
  filtros?: FiltrosLancamentos
): Promise<LancamentoFerias[]> {
  let query = supabase
    .from('lancamentos_ferias')
    .select(`
      *,
      periodo_aquisitivo:periodos_aquisitivos (
        id,
        numero,
        data_inicio,
        data_fim,
        data_limite_concessao,
        dias_direito,
        status
      ),
      funcionario:funcionarios (
        id,
        nome_completo,
        empresa_id
      )
    `)
    .order('data_inicio', { ascending: false })

  // Aplicar filtros
  if (filtros?.funcionario_id) {
    query = query.eq('funcionario_id', filtros.funcionario_id)
  }

  if (filtros?.periodo_aquisitivo_id) {
    query = query.eq('periodo_aquisitivo_id', filtros.periodo_aquisitivo_id)
  }

  if (filtros?.status) {
    if (Array.isArray(filtros.status)) {
      query = query.in('status', filtros.status)
    } else {
      query = query.eq('status', filtros.status)
    }
  }

  if (filtros?.data_inicio_de) {
    query = query.gte('data_inicio', filtros.data_inicio_de)
  }

  if (filtros?.data_inicio_ate) {
    query = query.lte('data_inicio', filtros.data_inicio_ate)
  }

  const { data, error } = await query

  if (error) {
    console.error('Erro ao listar lançamentos:', error)
    throw error
  }

  return data || []
}

/**
 * Busca lançamento por ID
 */
export async function buscarLancamento(id: number): Promise<LancamentoFerias | null> {
  const { data, error } = await supabase
    .from('lancamentos_ferias')
    .select(`
      *,
      periodo_aquisitivo:periodos_aquisitivos (
        id,
        numero,
        data_inicio,
        data_fim,
        data_limite_concessao,
        dias_direito,
        dias_gozados,
        dias_vendidos,
        dias_programados,
        status
      ),
      funcionario:funcionarios (
        id,
        nome_completo,
        empresa_id,
        salario
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    console.error('Erro ao buscar lançamento:', error)
    throw error
  }

  return data
}

/**
 * Busca lançamentos de um funcionário
 */
export async function buscarLancamentosFuncionario(
  funcionarioId: number
): Promise<LancamentoFerias[]> {
  return listarLancamentos({ funcionario_id: funcionarioId })
}

/**
 * Busca lançamentos de um período específico
 */
export async function buscarLancamentosPeriodo(
  periodoId: number
): Promise<LancamentoFerias[]> {
  return listarLancamentos({ periodo_aquisitivo_id: periodoId })
}

/**
 * Busca férias em andamento (em_gozo)
 */
export async function buscarFeriasEmAndamento(
  empresaId?: number
): Promise<LancamentoFerias[]> {
  let query = supabase
    .from('lancamentos_ferias')
    .select(`
      *,
      funcionario:funcionarios (
        id,
        nome_completo,
        empresa_id
      )
    `)
    .eq('status', 'em_gozo')
    .order('data_inicio', { ascending: true })

  if (empresaId) {
    query = query.eq('funcionario.empresa_id', empresaId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Erro ao buscar férias em andamento:', error)
    throw error
  }

  return data || []
}

/**
 * Busca férias programadas (futuras)
 */
export async function buscarFeriasProgramadas(
  empresaId?: number,
  dias?: number
): Promise<LancamentoFerias[]> {
  const hoje = new Date().toISOString().split('T')[0]
  
  let query = supabase
    .from('lancamentos_ferias')
    .select(`
      *,
      funcionario:funcionarios (
        id,
        nome_completo,
        empresa_id
      )
    `)
    .eq('status', 'programado')
    .gte('data_inicio', hoje)
    .order('data_inicio', { ascending: true })

  if (empresaId) {
    query = query.eq('funcionario.empresa_id', empresaId)
  }

  if (dias) {
    const dataLimite = new Date()
    dataLimite.setDate(dataLimite.getDate() + dias)
    query = query.lte('data_inicio', dataLimite.toISOString().split('T')[0])
  }

  const { data, error } = await query

  if (error) {
    console.error('Erro ao buscar férias programadas:', error)
    throw error
  }

  return data || []
}

// ============================================
// CRIAÇÃO
// ============================================

/**
 * Cria um novo lançamento de férias
 */
export async function criarLancamento(
  dados: NovoLancamentoFerias
): Promise<LancamentoFerias> {
  // 1. Buscar dados do período e funcionário
  const { data: periodo, error: erroPeriodo } = await supabase
    .from('periodos_aquisitivos')
    .select('*')
    .eq('id', dados.periodo_aquisitivo_id)
    .single()

  if (erroPeriodo || !periodo) {
    throw new Error('Período aquisitivo não encontrado')
  }

  const { data: funcionario, error: erroFunc } = await supabase
    .from('funcionarios')
    .select('id, nome_completo, salario')
    .eq('id', dados.funcionario_id)
    .single()

  if (erroFunc || !funcionario) {
    throw new Error('Funcionário não encontrado')
  }

  // 2. Buscar parcelas existentes
  const parcelasExistentes = await buscarLancamentosPeriodo(dados.periodo_aquisitivo_id)
  const parcelasAtivas = parcelasExistentes
    .filter(l => l.status !== 'cancelado')
    .map(l => ({ numero: l.parcela, dias: l.dias_gozados }))

  // 3. Calcular saldo disponível
  const saldo = periodo.dias_direito - periodo.dias_gozados - periodo.dias_vendidos - periodo.dias_programados

  // 4. Validar lançamento
  const validacao = validarLancamentoCompleto({
    periodo_status: periodo.status,
    dias_saldo: saldo,
    dias_gozados: dados.dias_gozados,
    dias_abono: dados.dias_abono || 0,
    data_inicio: dados.data_inicio,
    data_fim: dados.data_fim,
    data_limite_concessao: periodo.data_limite_concessao,
    parcela: dados.parcela || parcelasAtivas.length + 1,
    parcelas_existentes: parcelasAtivas as ParcelaFerias[],
  })

  if (!validacao.valido) {
    throw new Error(validacao.erro)
  }

  // 5. Calcular valores
  const calculo = calcularValoresFerias({
    salario_base: Number(funcionario.salario),
    media_horas_extras: dados.media_horas_extras,
    media_comissoes: dados.media_comissoes,
    media_adicional_noturno: dados.media_adicional_noturno,
    media_periculosidade: dados.media_periculosidade,
    media_insalubridade: dados.media_insalubridade,
    outros_adicionais: dados.outros_adicionais,
    dias_gozados: dados.dias_gozados,
    dias_abono: dados.dias_abono,
  })

  // 6. Inserir lançamento
  const { data: lancamento, error } = await supabase
    .from('lancamentos_ferias')
    .insert({
      periodo_aquisitivo_id: dados.periodo_aquisitivo_id,
      funcionario_id: dados.funcionario_id,
      data_inicio: dados.data_inicio,
      data_fim: dados.data_fim,
      dias_gozados: dados.dias_gozados,
      dias_abono: dados.dias_abono || 0,
      parcela: dados.parcela || parcelasAtivas.length + 1,
      salario_base: calculo.salario_base,
      media_horas_extras: calculo.media_horas_extras,
      media_comissoes: calculo.media_comissoes,
      media_adicional_noturno: calculo.media_adicional_noturno,
      media_periculosidade: calculo.media_periculosidade,
      media_insalubridade: calculo.media_insalubridade,
      outros_adicionais: calculo.outros_adicionais,
      descricao_outros_adicionais: dados.descricao_outros_adicionais || null,
      base_calculo: calculo.base_calculo,
      valor_ferias: calculo.valor_ferias,
      valor_terco: calculo.valor_terco,
      valor_abono: calculo.valor_abono,
      valor_terco_abono: calculo.valor_terco_abono,
      valor_total: calculo.valor_total,
      status: 'programado',
      observacoes: dados.observacoes || null,
    })
    .select()
    .single()

  if (error) {
    console.error('Erro ao criar lançamento:', error)
    throw error
  }

  // 7. Atualizar período (dias programados)
  await atualizarDias(dados.periodo_aquisitivo_id, {
    dias_programados: periodo.dias_programados + dados.dias_gozados,
    dias_vendidos: periodo.dias_vendidos + (dados.dias_abono || 0),
  })

  return lancamento
}

// ============================================
// ATUALIZAÇÃO
// ============================================

/**
 * Atualiza status do lançamento
 */
export async function atualizarStatusLancamento(
  lancamentoId: number,
  status: StatusLancamento
): Promise<LancamentoFerias> {
  const { data, error } = await supabase
    .from('lancamentos_ferias')
    .update({ 
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', lancamentoId)
    .select()
    .single()

  if (error) {
    console.error('Erro ao atualizar status:', error)
    throw error
  }

  return data
}

/**
 * Inicia férias (muda de programado para em_gozo)
 */
export async function iniciarFerias(lancamentoId: number): Promise<LancamentoFerias> {
  const lancamento = await buscarLancamento(lancamentoId)
  if (!lancamento) {
    throw new Error('Lançamento não encontrado')
  }

  if (lancamento.status !== 'programado') {
    throw new Error('Só é possível iniciar férias com status "programado"')
  }

  // Atualizar status
  const atualizado = await atualizarStatusLancamento(lancamentoId, 'em_gozo')

  // Atualizar período (mover de programados para gozados)
  if (lancamento.periodo_aquisitivo) {
    const periodo = lancamento.periodo_aquisitivo
    await atualizarDias(periodo.id, {
      dias_programados: Math.max(0, (periodo.dias_programados || 0) - lancamento.dias_gozados),
      dias_gozados: (periodo.dias_gozados || 0) + lancamento.dias_gozados,
      status: 'parcial',
    })
  }

  return atualizado
}

/**
 * Conclui férias (muda de em_gozo para concluido)
 */
export async function concluirFerias(lancamentoId: number): Promise<LancamentoFerias> {
  const lancamento = await buscarLancamento(lancamentoId)
  if (!lancamento) {
    throw new Error('Lançamento não encontrado')
  }

  if (lancamento.status !== 'em_gozo') {
    throw new Error('Só é possível concluir férias com status "em_gozo"')
  }

  // Atualizar status
  const atualizado = await atualizarStatusLancamento(lancamentoId, 'concluido')

  // Verificar se período foi quitado
  if (lancamento.periodo_aquisitivo) {
    const periodo = lancamento.periodo_aquisitivo
    const saldo = periodo.dias_direito - periodo.dias_gozados - periodo.dias_vendidos
    
    if (saldo <= 0) {
      await atualizarDias(periodo.id, { status: 'quitado' })
    }
  }

  return atualizado
}

/**
 * Cancela lançamento de férias
 */
export async function cancelarLancamento(
  lancamentoId: number,
  motivo?: string
): Promise<LancamentoFerias> {
  const lancamento = await buscarLancamento(lancamentoId)
  if (!lancamento) {
    throw new Error('Lançamento não encontrado')
  }

  if (lancamento.status === 'concluido') {
    throw new Error('Não é possível cancelar férias já concluídas')
  }

  if (lancamento.status === 'cancelado') {
    throw new Error('Lançamento já está cancelado')
  }

  // Atualizar status
  const { data, error } = await supabase
    .from('lancamentos_ferias')
    .update({ 
      status: 'cancelado',
      observacoes: motivo 
        ? `${lancamento.observacoes || ''}\n[CANCELADO] ${motivo}`.trim()
        : lancamento.observacoes,
      updated_at: new Date().toISOString(),
    })
    .eq('id', lancamentoId)
    .select()
    .single()

  if (error) {
    console.error('Erro ao cancelar lançamento:', error)
    throw error
  }

  // Reverter dias no período
  if (lancamento.periodo_aquisitivo) {
    const periodo = lancamento.periodo_aquisitivo
    
    if (lancamento.status === 'programado') {
      // Estava programado: reverter dias_programados e dias_vendidos
      await atualizarDias(periodo.id, {
        dias_programados: Math.max(0, (periodo.dias_programados || 0) - lancamento.dias_gozados),
        dias_vendidos: Math.max(0, (periodo.dias_vendidos || 0) - lancamento.dias_abono),
      })
    } else if (lancamento.status === 'em_gozo') {
      // Estava em gozo: reverter dias_gozados
      await atualizarDias(periodo.id, {
        dias_gozados: Math.max(0, (periodo.dias_gozados || 0) - lancamento.dias_gozados),
        status: 'adquirido',
      })
    }
  }

  return data
}

// ============================================
// ATUALIZAÇÃO AUTOMÁTICA DE STATUS
// ============================================

/**
 * Atualiza status de lançamentos baseado nas datas
 * - Programado com data_inicio <= hoje -> em_gozo
 * - Em gozo com data_fim < hoje -> concluido
 */
export async function atualizarStatusAutomatico(): Promise<{
  iniciados: number
  concluidos: number
}> {
  const hoje = new Date().toISOString().split('T')[0]
  let iniciados = 0
  let concluidos = 0

  // 1. Buscar programados que devem iniciar
  const { data: paraIniciar } = await supabase
    .from('lancamentos_ferias')
    .select('id')
    .eq('status', 'programado')
    .lte('data_inicio', hoje)

  if (paraIniciar) {
    for (const l of paraIniciar) {
      try {
        await iniciarFerias(l.id)
        iniciados++
      } catch (e) {
        console.error(`Erro ao iniciar férias ${l.id}:`, e)
      }
    }
  }

  // 2. Buscar em_gozo que devem concluir
  const { data: paraConcluir } = await supabase
    .from('lancamentos_ferias')
    .select('id')
    .eq('status', 'em_gozo')
    .lt('data_fim', hoje)

  if (paraConcluir) {
    for (const l of paraConcluir) {
      try {
        await concluirFerias(l.id)
        concluidos++
      } catch (e) {
        console.error(`Erro ao concluir férias ${l.id}:`, e)
      }
    }
  }

  return { iniciados, concluidos }
}