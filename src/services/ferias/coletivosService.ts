// ============================================
// SERVICE: FÉRIAS COLETIVAS
// ============================================

import { supabase } from '@/lib/supabase'
import { 
  FeriasColetivas,
  NovasFeriasColetivas,
  StatusFeriasColetivas,
} from '@/types/ferias'
import { buscarPeriodosComSaldo, atualizarDias } from './periodosService'

// ============================================
// LISTAGEM
// ============================================

/**
 * Lista todas as férias coletivas
 */
export async function listarFeriasColetivas(
  empresaId?: number,
  ano?: number
): Promise<FeriasColetivas[]> {
  let query = supabase
    .from('ferias_coletivas')
    .select(`
      *,
      empresa:empresas (
        id,
        razao_social
      )
    `)
    .order('data_inicio', { ascending: false })

  if (empresaId) {
    query = query.eq('empresa_id', empresaId)
  }

  if (ano) {
    query = query.eq('ano_referencia', ano)
  }

  const { data, error } = await query

  if (error) {
    console.error('Erro ao listar férias coletivas:', error)
    throw error
  }

  return data || []
}

/**
 * Busca férias coletivas por ID
 */
export async function buscarFeriasColetivas(
  id: number
): Promise<FeriasColetivas | null> {
  const { data, error } = await supabase
    .from('ferias_coletivas')
    .select(`
      *,
      empresa:empresas (
        id,
        razao_social
      ),
      funcionarios:ferias_coletivas_funcionarios (
        id,
        funcionario_id,
        periodo_aquisitivo_id,
        dias_debitados,
        proporcional,
        funcionario:funcionarios (
          id,
          nome_completo
        )
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    console.error('Erro ao buscar férias coletivas:', error)
    throw error
  }

  return data
}

// ============================================
// CRIAÇÃO
// ============================================

/**
 * Programa férias coletivas
 */
export async function programarFeriasColetivas(
  dados: NovasFeriasColetivas
): Promise<FeriasColetivas> {
  // 1. Criar registro de férias coletivas
  const { data: feriasColetivas, error: erroColetivas } = await supabase
    .from('ferias_coletivas')
    .insert({
      empresa_id: dados.empresa_id,
      setor_id: dados.setor_id || null,
      data_inicio: dados.data_inicio,
      data_fim: dados.data_fim,
      dias: dados.dias,
      descricao: dados.descricao || null,
      ano_referencia: dados.ano_referencia,
      status: 'programada',
    })
    .select()
    .single()

  if (erroColetivas) {
    console.error('Erro ao criar férias coletivas:', erroColetivas)
    throw erroColetivas
  }

  // 2. Processar cada funcionário
  const funcionariosProcessados: {
    funcionario_id: number
    periodo_aquisitivo_id: number | null
    dias_debitados: number
    proporcional: boolean
  }[] = []

  for (const funcionarioId of dados.funcionarios_ids) {
    // Buscar períodos com saldo
    const periodos = await buscarPeriodosComSaldo(funcionarioId)
    
    let diasRestantes = dados.dias
    let periodoUsado: number | null = null
    let proporcional = false

    if (periodos.length === 0) {
      // Funcionário sem período completo - proporcional
      proporcional = true
      periodoUsado = null
    } else {
      // Usar o período mais antigo com saldo
      const periodoMaisAntigo = periodos[0]
      periodoUsado = periodoMaisAntigo.id
      
      // Verificar se tem saldo suficiente
      if (periodoMaisAntigo.dias_saldo < dados.dias) {
        // Débito parcial - usa o que tem
        diasRestantes = periodoMaisAntigo.dias_saldo
      }
    }

    funcionariosProcessados.push({
      funcionario_id: funcionarioId,
      periodo_aquisitivo_id: periodoUsado,
      dias_debitados: diasRestantes,
      proporcional,
    })
  }

  // 3. Inserir funcionários nas férias coletivas
  if (funcionariosProcessados.length > 0) {
    const registros = funcionariosProcessados.map(f => ({
      ferias_coletiva_id: feriasColetivas.id,
      funcionario_id: f.funcionario_id,
      periodo_aquisitivo_id: f.periodo_aquisitivo_id,
      dias_debitados: f.dias_debitados,
      proporcional: f.proporcional,
    }))

    const { error: erroFuncs } = await supabase
      .from('ferias_coletivas_funcionarios')
      .insert(registros)

    if (erroFuncs) {
      console.error('Erro ao inserir funcionários:', erroFuncs)
      // Rollback - excluir férias coletivas
      await supabase.from('ferias_coletivas').delete().eq('id', feriasColetivas.id)
      throw erroFuncs
    }

    // 4. Atualizar dias programados nos períodos
    for (const f of funcionariosProcessados) {
      if (f.periodo_aquisitivo_id) {
        const { data: periodo } = await supabase
          .from('periodos_aquisitivos')
          .select('dias_programados')
          .eq('id', f.periodo_aquisitivo_id)
          .single()

        if (periodo) {
          await atualizarDias(f.periodo_aquisitivo_id, {
            dias_programados: (periodo.dias_programados || 0) + f.dias_debitados,
          })
        }
      }
    }
  }

  return feriasColetivas
}

// ============================================
// ATUALIZAÇÃO DE STATUS
// ============================================

/**
 * Atualiza status das férias coletivas
 */
export async function atualizarStatusFeriasColetivas(
  id: number,
  status: StatusFeriasColetivas
): Promise<FeriasColetivas> {
  const { data, error } = await supabase
    .from('ferias_coletivas')
    .update({ 
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Erro ao atualizar status:', error)
    throw error
  }

  return data
}

/**
 * Inicia férias coletivas
 */
export async function iniciarFeriasColetivas(id: number): Promise<FeriasColetivas> {
  const coletivas = await buscarFeriasColetivas(id)
  if (!coletivas) {
    throw new Error('Férias coletivas não encontradas')
  }

  if (coletivas.status !== 'programada') {
    throw new Error('Só é possível iniciar férias coletivas com status "programada"')
  }

  // Atualizar status
  const atualizado = await atualizarStatusFeriasColetivas(id, 'em_andamento')

  // Mover dias de programados para gozados em cada período
  if (coletivas.funcionarios) {
    for (const func of coletivas.funcionarios) {
      if (func.periodo_aquisitivo_id) {
        const { data: periodo } = await supabase
          .from('periodos_aquisitivos')
          .select('dias_gozados, dias_programados')
          .eq('id', func.periodo_aquisitivo_id)
          .single()

        if (periodo) {
          await atualizarDias(func.periodo_aquisitivo_id, {
            dias_programados: Math.max(0, (periodo.dias_programados || 0) - func.dias_debitados),
            dias_gozados: (periodo.dias_gozados || 0) + func.dias_debitados,
            status: 'parcial',
          })
        }
      }
    }
  }

  return atualizado
}

/**
 * Conclui férias coletivas
 */
export async function concluirFeriasColetivas(id: number): Promise<FeriasColetivas> {
  const coletivas = await buscarFeriasColetivas(id)
  if (!coletivas) {
    throw new Error('Férias coletivas não encontradas')
  }

  if (coletivas.status !== 'em_andamento') {
    throw new Error('Só é possível concluir férias coletivas com status "em_andamento"')
  }

  return atualizarStatusFeriasColetivas(id, 'concluida')
}

/**
 * Cancela férias coletivas
 */
export async function cancelarFeriasColetivas(
  id: number,
  motivo?: string
): Promise<FeriasColetivas> {
  const coletivas = await buscarFeriasColetivas(id)
  if (!coletivas) {
    throw new Error('Férias coletivas não encontradas')
  }

  if (coletivas.status === 'concluida') {
    throw new Error('Não é possível cancelar férias coletivas já concluídas')
  }

  // Reverter dias nos períodos
  if (coletivas.funcionarios) {
    for (const func of coletivas.funcionarios) {
      if (func.periodo_aquisitivo_id) {
        const { data: periodo } = await supabase
          .from('periodos_aquisitivos')
          .select('dias_gozados, dias_programados')
          .eq('id', func.periodo_aquisitivo_id)
          .single()

        if (periodo) {
          if (coletivas.status === 'programada') {
            // Reverter dias_programados
            await atualizarDias(func.periodo_aquisitivo_id, {
              dias_programados: Math.max(0, (periodo.dias_programados || 0) - func.dias_debitados),
            })
          } else if (coletivas.status === 'em_andamento') {
            // Reverter dias_gozados
            await atualizarDias(func.periodo_aquisitivo_id, {
              dias_gozados: Math.max(0, (periodo.dias_gozados || 0) - func.dias_debitados),
              status: 'adquirido',
            })
          }
        }
      }
    }
  }

  // Atualizar status
  const { data, error } = await supabase
    .from('ferias_coletivas')
    .update({ 
      status: 'cancelada',
      descricao: motivo 
        ? `${coletivas.descricao || ''}\n[CANCELADO] ${motivo}`.trim()
        : coletivas.descricao,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Erro ao cancelar férias coletivas:', error)
    throw error
  }

  return data
}

// ============================================
// GESTÃO DE FUNCIONÁRIOS
// ============================================

/**
 * Adiciona funcionário às férias coletivas
 */
export async function adicionarFuncionario(
  feriasColetivaid: number,
  funcionarioId: number
): Promise<void> {
  // Buscar férias coletivas
  const coletivas = await buscarFeriasColetivas(feriasColetivaid)
  if (!coletivas) {
    throw new Error('Férias coletivas não encontradas')
  }

  if (coletivas.status !== 'programada') {
    throw new Error('Só é possível adicionar funcionários em férias programadas')
  }

  // Verificar se já está incluído
  const jaExiste = coletivas.funcionarios?.some(f => f.funcionario_id === funcionarioId)
  if (jaExiste) {
    throw new Error('Funcionário já está incluído nessas férias coletivas')
  }

  // Buscar período com saldo
  const periodos = await buscarPeriodosComSaldo(funcionarioId)
  
  let periodoUsado: number | null = null
  let diasDebitados = coletivas.dias
  let proporcional = false

  if (periodos.length === 0) {
    proporcional = true
  } else {
    periodoUsado = periodos[0].id
    if (periodos[0].dias_saldo < coletivas.dias) {
      diasDebitados = periodos[0].dias_saldo
    }
  }

  // Inserir
  const { error } = await supabase
    .from('ferias_coletivas_funcionarios')
    .insert({
      ferias_coletiva_id: feriasColetivaid,
      funcionario_id: funcionarioId,
      periodo_aquisitivo_id: periodoUsado,
      dias_debitados: diasDebitados,
      proporcional,
    })

  if (error) {
    console.error('Erro ao adicionar funcionário:', error)
    throw error
  }

  // Atualizar dias programados no período
  if (periodoUsado) {
    const { data: periodo } = await supabase
      .from('periodos_aquisitivos')
      .select('dias_programados')
      .eq('id', periodoUsado)
      .single()

    if (periodo) {
      await atualizarDias(periodoUsado, {
        dias_programados: (periodo.dias_programados || 0) + diasDebitados,
      })
    }
  }
}

/**
 * Remove funcionário das férias coletivas
 */
export async function removerFuncionario(
  feriasColetivaid: number,
  funcionarioId: number
): Promise<void> {
  // Buscar férias coletivas
  const coletivas = await buscarFeriasColetivas(feriasColetivaid)
  if (!coletivas) {
    throw new Error('Férias coletivas não encontradas')
  }

  if (coletivas.status !== 'programada') {
    throw new Error('Só é possível remover funcionários de férias programadas')
  }

  // Buscar registro do funcionário
  const registro = coletivas.funcionarios?.find(f => f.funcionario_id === funcionarioId)
  if (!registro) {
    throw new Error('Funcionário não encontrado nessas férias coletivas')
  }

  // Remover
  const { error } = await supabase
    .from('ferias_coletivas_funcionarios')
    .delete()
    .eq('ferias_coletiva_id', feriasColetivaid)
    .eq('funcionario_id', funcionarioId)

  if (error) {
    console.error('Erro ao remover funcionário:', error)
    throw error
  }

  // Reverter dias programados no período
  if (registro.periodo_aquisitivo_id) {
    const { data: periodo } = await supabase
      .from('periodos_aquisitivos')
      .select('dias_programados')
      .eq('id', registro.periodo_aquisitivo_id)
      .single()

    if (periodo) {
      await atualizarDias(registro.periodo_aquisitivo_id, {
        dias_programados: Math.max(0, (periodo.dias_programados || 0) - registro.dias_debitados),
      })
    }
  }
}

// ============================================
// CONSULTAS
// ============================================

/**
 * Busca próximas férias coletivas
 */
export async function buscarProximasFeriasColetivas(
  empresaId?: number,
  dias?: number
): Promise<FeriasColetivas[]> {
  const hoje = new Date().toISOString().split('T')[0]
  
  let query = supabase
    .from('ferias_coletivas')
    .select(`
      *,
      empresa:empresas (
        id,
        razao_social
      )
    `)
    .in('status', ['programada', 'em_andamento'])
    .gte('data_inicio', hoje)
    .order('data_inicio')

  if (empresaId) {
    query = query.eq('empresa_id', empresaId)
  }

  if (dias) {
    const dataLimite = new Date()
    dataLimite.setDate(dataLimite.getDate() + dias)
    query = query.lte('data_inicio', dataLimite.toISOString().split('T')[0])
  }

  const { data, error } = await query

  if (error) {
    console.error('Erro ao buscar próximas férias coletivas:', error)
    throw error
  }

  return data || []
}