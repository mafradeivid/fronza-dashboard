// ============================================
// SERVICE: SALDOS DE FÉRIAS
// ============================================

import { supabase } from '@/lib/supabase'
import { 
  SaldoFeriasFuncionario, 
  FeriasVencendo,
} from '@/types/ferias'

// ============================================
// SALDO POR FUNCIONÁRIO
// ============================================

/**
 * Busca saldo de férias de todos os funcionários
 * Usa a view vw_saldo_ferias
 */
export async function listarSaldos(
  empresaId?: number
): Promise<SaldoFeriasFuncionario[]> {
  let query = supabase
    .from('vw_saldo_ferias')
    .select('*')
    .order('saldo_disponivel', { ascending: false })

  if (empresaId) {
    query = query.eq('empresa_id', empresaId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Erro ao listar saldos:', error)
    throw error
  }

  return data || []
}

/**
 * Busca saldo de um funcionário específico
 */
export async function buscarSaldoFuncionario(
  funcionarioId: number
): Promise<SaldoFeriasFuncionario | null> {
  const { data, error } = await supabase
    .from('vw_saldo_ferias')
    .select('*')
    .eq('funcionario_id', funcionarioId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    console.error('Erro ao buscar saldo:', error)
    throw error
  }

  return data
}

/**
 * Busca funcionários com férias vencidas
 */
export async function buscarComFeriasVencidas(
  empresaId?: number
): Promise<SaldoFeriasFuncionario[]> {
  let query = supabase
    .from('vw_saldo_ferias')
    .select('*')
    .eq('tem_ferias_vencidas', true)
    .order('nome_completo')

  if (empresaId) {
    query = query.eq('empresa_id', empresaId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Erro ao buscar férias vencidas:', error)
    throw error
  }

  return data || []
}

/**
 * Busca funcionários com alerta de vencimento
 */
export async function buscarComAlertaVencimento(
  empresaId?: number
): Promise<SaldoFeriasFuncionario[]> {
  let query = supabase
    .from('vw_saldo_ferias')
    .select('*')
    .eq('alerta_vencendo', true)
    .order('nome_completo')

  if (empresaId) {
    query = query.eq('empresa_id', empresaId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Erro ao buscar alertas:', error)
    throw error
  }

  return data || []
}

// ============================================
// FÉRIAS VENCENDO
// ============================================

/**
 * Lista períodos próximos de vencer
 * Usa a view vw_ferias_vencendo
 */
export async function listarFeriasVencendo(
  empresaId?: number,
  nivelUrgencia?: string | string[]
): Promise<FeriasVencendo[]> {
  let query = supabase
    .from('vw_ferias_vencendo')
    .select('*')
    .order('dias_para_vencer', { ascending: true })

  if (empresaId) {
    query = query.eq('empresa_id', empresaId)
  }

  if (nivelUrgencia) {
    if (Array.isArray(nivelUrgencia)) {
      query = query.in('nivel_urgencia', nivelUrgencia)
    } else {
      query = query.eq('nivel_urgencia', nivelUrgencia)
    }
  }

  const { data, error } = await query

  if (error) {
    console.error('Erro ao listar férias vencendo:', error)
    throw error
  }

  return data || []
}

/**
 * Busca períodos críticos (vencendo em até 30 dias)
 */
export async function buscarPeriodosCriticos(
  empresaId?: number
): Promise<FeriasVencendo[]> {
  return listarFeriasVencendo(empresaId, ['critico', 'vencido'])
}

/**
 * Busca períodos com alerta (vencendo em até 60 dias)
 */
export async function buscarPeriodosComAlerta(
  empresaId?: number
): Promise<FeriasVencendo[]> {
  return listarFeriasVencendo(empresaId, ['critico', 'alerta', 'vencido'])
}

// ============================================
// ESTATÍSTICAS
// ============================================

export interface EstatisticasFerias {
  totalFuncionarios: number
  funcionariosComSaldo: number
  funcionariosSemSaldo: number
  funcionariosComVencidas: number
  funcionariosComAlerta: number
  totalDiasDisponiveis: number
  totalDiasProgramados: number
  periodosCriticos: number
  periodosVencidos: number
  periodosAProgramar: number // NOVO: períodos com saldo pendente de programação
}

/**
 * Calcula estatísticas gerais de férias
 */
export async function calcularEstatisticas(
  empresaId?: number
): Promise<EstatisticasFerias> {
  // Buscar saldos
  const saldos = await listarSaldos(empresaId)
  
  // Buscar períodos vencendo
  const vencendo = await listarFeriasVencendo(empresaId)

  // Buscar períodos com saldo > 0 (pendentes de programação)
  let queryPeriodos = supabase
    .from('periodos_aquisitivos')
    .select('id, funcionario_id, dias_direito, dias_gozados, dias_vendidos, status', { count: 'exact' })
    .neq('status', 'quitado')
    .neq('status', 'em_aquisicao')
  
  if (empresaId) {
    // Se tem filtro de empresa, precisamos filtrar pelos funcionários da empresa
    const { data: funcIds } = await supabase
      .from('funcionarios')
      .select('id')
      .eq('empresa_id', empresaId)
      .eq('status', 'ativo')
    
    if (funcIds && funcIds.length > 0) {
      queryPeriodos = queryPeriodos.in('funcionario_id', funcIds.map(f => f.id))
    }
  }

  const { data: periodosComSaldo } = await queryPeriodos

  // Filtrar apenas os que realmente têm saldo disponível
  const periodosParaProgramar = (periodosComSaldo || []).filter(p => {
    const saldo = p.dias_direito - p.dias_gozados - p.dias_vendidos
    return saldo > 0
  })

  // Calcular estatísticas
  const stats: EstatisticasFerias = {
    totalFuncionarios: saldos.length,
    funcionariosComSaldo: saldos.filter(s => s.saldo_disponivel > 0).length,
    funcionariosSemSaldo: saldos.filter(s => s.saldo_disponivel <= 0).length,
    funcionariosComVencidas: saldos.filter(s => s.tem_ferias_vencidas).length,
    funcionariosComAlerta: saldos.filter(s => s.alerta_vencendo).length,
    totalDiasDisponiveis: saldos.reduce((acc, s) => acc + s.saldo_disponivel, 0),
    totalDiasProgramados: saldos.reduce((acc, s) => acc + s.total_dias_programados, 0),
    periodosCriticos: vencendo.filter(v => v.nivel_urgencia === 'critico').length,
    periodosVencidos: vencendo.filter(v => v.nivel_urgencia === 'vencido').length,
    periodosAProgramar: periodosParaProgramar.length,
  }

  return stats
}

// ============================================
// CALENDÁRIO
// ============================================

export interface FeriasCalendario {
  funcionario_id: number
  nome_completo: string
  data_inicio: string
  data_fim: string
  dias: number
  status: string
}

/**
 * Busca férias para exibição em calendário
 */
export async function buscarFeriasCalendario(
  empresaId?: number,
  mesInicio?: string,
  mesFim?: string
): Promise<FeriasCalendario[]> {
  let query = supabase
    .from('lancamentos_ferias')
    .select(`
      funcionario_id,
      data_inicio,
      data_fim,
      dias_gozados,
      status,
      funcionario:funcionarios (
        nome_completo
      )
    `)
    .in('status', ['programado', 'em_gozo', 'concluido'])
    .order('data_inicio')

  if (mesInicio) {
    query = query.gte('data_fim', mesInicio)
  }

  if (mesFim) {
    query = query.lte('data_inicio', mesFim)
  }

  const { data, error } = await query

  if (error) {
    console.error('Erro ao buscar calendário:', error)
    throw error
  }

  // Filtrar por empresa se necessário
  let resultado = (data || []).map(item => {
    // Supabase pode retornar objeto ou array dependendo da relação
    const funcData = item.funcionario
    const func = Array.isArray(funcData) ? funcData[0] : funcData
    
    return {
      funcionario_id: item.funcionario_id,
      nome_completo: (func as { nome_completo?: string })?.nome_completo || '',
      data_inicio: item.data_inicio,
      data_fim: item.data_fim,
      dias: item.dias_gozados,
      status: item.status,
    }
  })

  // Se tem filtro de empresa, precisamos filtrar depois
  // (idealmente seria no join, mas Supabase tem limitações)
  if (empresaId) {
    const { data: funcIds } = await supabase
      .from('funcionarios')
      .select('id')
      .eq('empresa_id', empresaId)

    const idsPermitidos = new Set(funcIds?.map(f => f.id) || [])
    resultado = resultado.filter(r => idsPermitidos.has(r.funcionario_id))
  }

  return resultado
}

// ============================================
// RESUMO POR EMPRESA
// ============================================

export interface ResumoEmpresaFerias {
  empresa_id: number
  empresa_nome: string
  total_funcionarios: number
  total_dias_disponiveis: number
  funcionarios_com_alerta: number
  funcionarios_com_vencidas: number
}

/**
 * Gera resumo de férias agrupado por empresa
 */
export async function gerarResumoEmpresas(): Promise<ResumoEmpresaFerias[]> {
  const saldos = await listarSaldos()

  // Agrupar por empresa
  const porEmpresa = new Map<number, ResumoEmpresaFerias>()

  for (const saldo of saldos) {
    const empresaId = saldo.empresa_id
    
    if (!porEmpresa.has(empresaId)) {
      porEmpresa.set(empresaId, {
        empresa_id: empresaId,
        empresa_nome: saldo.empresa_nome,
        total_funcionarios: 0,
        total_dias_disponiveis: 0,
        funcionarios_com_alerta: 0,
        funcionarios_com_vencidas: 0,
      })
    }

    const resumo = porEmpresa.get(empresaId)!
    resumo.total_funcionarios++
    resumo.total_dias_disponiveis += saldo.saldo_disponivel
    if (saldo.alerta_vencendo) resumo.funcionarios_com_alerta++
    if (saldo.tem_ferias_vencidas) resumo.funcionarios_com_vencidas++
  }

  return Array.from(porEmpresa.values()).sort((a, b) => 
    a.empresa_nome.localeCompare(b.empresa_nome)
  )
}