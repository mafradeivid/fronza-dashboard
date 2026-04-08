// ============================================
// SERVICE: PERÍODOS AQUISITIVOS
// ============================================

import { supabase } from '@/lib/supabase'
import { 
  PeriodoAquisitivo, 
  PeriodoAquisitivoComSaldo,
  FiltrosPeriodos,
  StatusPeriodo,
  NivelUrgencia,
} from '@/types/ferias'

// ============================================
// LISTAGEM
// ============================================

/**
 * Lista períodos aquisitivos com filtros
 */
export async function listarPeriodos(
  filtros?: FiltrosPeriodos
): Promise<PeriodoAquisitivoComSaldo[]> {
  let query = supabase
    .from('periodos_aquisitivos')
    .select(`
      *,
      funcionario:funcionarios (
        id,
        nome_completo,
        empresa_id,
        admissao
      )
    `)
    .order('data_limite_concessao', { ascending: true })

  // Aplicar filtros
  if (filtros?.funcionario_id) {
    query = query.eq('funcionario_id', filtros.funcionario_id)
  }

  if (filtros?.empresa_id) {
    query = query.eq('funcionario.empresa_id', filtros.empresa_id)
  }

  if (filtros?.status) {
    if (Array.isArray(filtros.status)) {
      query = query.in('status', filtros.status)
    } else {
      query = query.eq('status', filtros.status)
    }
  }

  if (filtros?.apenas_com_saldo) {
    query = query.gt('dias_direito', 0)
  }

  const { data, error } = await query

  if (error) {
    console.error('Erro ao listar períodos:', error)
    throw error
  }

  // Calcular campos derivados
  return (data || []).map(periodo => calcularCamposDerivados(periodo))
}

/**
 * Busca período por ID
 */
export async function buscarPeriodo(id: number): Promise<PeriodoAquisitivoComSaldo | null> {
  const { data, error } = await supabase
    .from('periodos_aquisitivos')
    .select(`
      *,
      funcionario:funcionarios (
        id,
        nome_completo,
        empresa_id,
        admissao
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    console.error('Erro ao buscar período:', error)
    throw error
  }

  return calcularCamposDerivados(data)
}

/**
 * Busca períodos de um funcionário
 */
export async function buscarPeriodosFuncionario(
  funcionarioId: number
): Promise<PeriodoAquisitivoComSaldo[]> {
  return listarPeriodos({ funcionario_id: funcionarioId })
}

/**
 * Busca períodos com saldo disponível de um funcionário
 */
export async function buscarPeriodosComSaldo(
  funcionarioId: number
): Promise<PeriodoAquisitivoComSaldo[]> {
  const periodos = await listarPeriodos({ 
    funcionario_id: funcionarioId,
    status: ['adquirido', 'parcial'],
    apenas_com_saldo: true,
  })

  return periodos.filter(p => p.dias_saldo > 0)
}

// ============================================
// GERAÇÃO AUTOMÁTICA
// ============================================

/**
 * Gera períodos aquisitivos para um funcionário
 * Chama a função do banco
 */
export async function gerarPeriodosFuncionario(
  funcionarioId: number,
  dataCorte: string = '2025-01-01'
): Promise<number> {
  const { data, error } = await supabase
    .rpc('gerar_periodos_aquisitivos', {
      p_funcionario_id: funcionarioId,
      p_data_corte: dataCorte,
    })

  if (error) {
    console.error('Erro ao gerar períodos:', error)
    throw error
  }

  return data || 0
}

/**
 * Gera períodos para todos os funcionários ativos
 */
export async function gerarTodosPeriodos(
  dataCorte: string = '2025-01-01'
): Promise<{ funcionario_id: number; nome: string; periodos_criados: number }[]> {
  const { data, error } = await supabase
    .rpc('gerar_todos_periodos_aquisitivos', {
      p_data_corte: dataCorte,
    })

  if (error) {
    console.error('Erro ao gerar todos os períodos:', error)
    throw error
  }

  return data || []
}

/**
 * Atualiza status de todos os períodos
 * (marca como adquirido, vencido, etc.)
 */
export async function atualizarStatusPeriodos(): Promise<number> {
  const { data, error } = await supabase
    .rpc('atualizar_status_periodos')

  if (error) {
    console.error('Erro ao atualizar status:', error)
    throw error
  }

  return data || 0
}

// ============================================
// ATUALIZAÇÃO
// ============================================

/**
 * Atualiza faltas injustificadas e recalcula dias de direito
 */
export async function atualizarFaltas(
  periodoId: number,
  faltas: number
): Promise<PeriodoAquisitivoComSaldo> {
  // Calcular dias de direito baseado nas faltas (CLT Art. 130)
  let diasDireito = 30
  if (faltas > 32) diasDireito = 0
  else if (faltas > 23) diasDireito = 12
  else if (faltas > 14) diasDireito = 18
  else if (faltas > 5) diasDireito = 24

  const { data, error } = await supabase
    .from('periodos_aquisitivos')
    .update({
      faltas_injustificadas: faltas,
      dias_direito: diasDireito,
      updated_at: new Date().toISOString(),
    })
    .eq('id', periodoId)
    .select()
    .single()

  if (error) {
    console.error('Erro ao atualizar faltas:', error)
    throw error
  }

  return calcularCamposDerivados(data)
}

/**
 * Atualiza dias gozados/vendidos/programados
 */
export async function atualizarDias(
  periodoId: number,
  dados: {
    dias_gozados?: number
    dias_vendidos?: number
    dias_programados?: number
    status?: StatusPeriodo
  }
): Promise<PeriodoAquisitivoComSaldo> {
  const { data, error } = await supabase
    .from('periodos_aquisitivos')
    .update({
      ...dados,
      updated_at: new Date().toISOString(),
    })
    .eq('id', periodoId)
    .select()
    .single()

  if (error) {
    console.error('Erro ao atualizar dias:', error)
    throw error
  }

  return calcularCamposDerivados(data)
}

/**
 * Adiciona observação ao período
 */
export async function adicionarObservacao(
  periodoId: number,
  observacao: string
): Promise<void> {
  const { error } = await supabase
    .from('periodos_aquisitivos')
    .update({
      observacoes: observacao,
      updated_at: new Date().toISOString(),
    })
    .eq('id', periodoId)

  if (error) {
    console.error('Erro ao adicionar observação:', error)
    throw error
  }
}

// ============================================
// CONSULTAS ESPECIAIS
// ============================================

/**
 * Busca períodos vencendo nos próximos X dias
 */
export async function buscarPeriodosVencendo(
  dias: number = 60,
  empresaId?: number
): Promise<PeriodoAquisitivoComSaldo[]> {
  const dataLimite = new Date()
  dataLimite.setDate(dataLimite.getDate() + dias)

  let query = supabase
    .from('periodos_aquisitivos')
    .select(`
      *,
      funcionario:funcionarios (
        id,
        nome_completo,
        empresa_id,
        admissao
      )
    `)
    .in('status', ['adquirido', 'parcial'])
    .lte('data_limite_concessao', dataLimite.toISOString().split('T')[0])
    .order('data_limite_concessao', { ascending: true })

  if (empresaId) {
    query = query.eq('funcionario.empresa_id', empresaId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Erro ao buscar períodos vencendo:', error)
    throw error
  }

  return (data || [])
    .map(periodo => calcularCamposDerivados(periodo))
    .filter(p => p.dias_saldo > 0)
}

/**
 * Busca períodos já vencidos
 */
export async function buscarPeriodosVencidos(
  empresaId?: number
): Promise<PeriodoAquisitivoComSaldo[]> {
  let query = supabase
    .from('periodos_aquisitivos')
    .select(`
      *,
      funcionario:funcionarios (
        id,
        nome_completo,
        empresa_id,
        admissao
      )
    `)
    .eq('status', 'vencido')
    .order('data_limite_concessao', { ascending: true })

  if (empresaId) {
    query = query.eq('funcionario.empresa_id', empresaId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Erro ao buscar períodos vencidos:', error)
    throw error
  }

  return (data || []).map(periodo => calcularCamposDerivados(periodo))
}

// ============================================
// HELPERS
// ============================================

/**
 * Calcula campos derivados do período
 */
function calcularCamposDerivados(periodo: PeriodoAquisitivo): PeriodoAquisitivoComSaldo {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  
  const dataLimite = new Date(periodo.data_limite_concessao)
  dataLimite.setHours(0, 0, 0, 0)

  // Saldo de dias
  const dias_saldo = periodo.dias_direito - periodo.dias_gozados - periodo.dias_vendidos - periodo.dias_programados

  // Dias para vencer
  const diffMs = dataLimite.getTime() - hoje.getTime()
  const dias_para_vencer = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  // Nível de urgência
  let nivel_urgencia: NivelUrgencia = 'ok'
  if (dias_para_vencer < 0) nivel_urgencia = 'vencido'
  else if (dias_para_vencer <= 30) nivel_urgencia = 'critico'
  else if (dias_para_vencer <= 60) nivel_urgencia = 'alerta'
  else if (dias_para_vencer <= 90) nivel_urgencia = 'atencao'

  // Pode fracionar (máximo 3 parcelas)
  // Precisaria consultar lançamentos para saber quantas parcelas já usou
  const pode_fracionar = dias_saldo >= 5 // Mínimo para uma parcela adicional

  return {
    ...periodo,
    dias_saldo,
    dias_para_vencer,
    nivel_urgencia,
    pode_fracionar,
    parcelas_usadas: 0, // Será preenchido quando carregar lançamentos
  }
}

/**
 * Conta parcelas usadas de um período
 */
export async function contarParcelasUsadas(periodoId: number): Promise<number> {
  const { count, error } = await supabase
    .from('lancamentos_ferias')
    .select('*', { count: 'exact', head: true })
    .eq('periodo_aquisitivo_id', periodoId)
    .neq('status', 'cancelado')

  if (error) {
    console.error('Erro ao contar parcelas:', error)
    return 0
  }

  return count || 0
}