// ============================================
// SERVICE: PERÍODOS - FUNÇÕES ADICIONAIS
// Rede de segurança para geração de períodos
// ============================================

import { supabase } from '@/lib/supabase'
import { gerarPeriodosFuncionario, atualizarStatusPeriodos } from './periodosService'

// ============================================
// REDE DE SEGURANÇA
// Verifica se funcionário tem períodos, gera se não tiver
// ============================================

export async function garantirPeriodosFuncionario(funcionarioId: number): Promise<{
  existiam: boolean
  gerados: number
}> {
  // Verificar se já tem períodos
  const { count, error } = await supabase
    .from('periodos_aquisitivos')
    .select('*', { count: 'exact', head: true })
    .eq('funcionario_id', funcionarioId)

  if (error) throw error

  if (count && count > 0) {
    // Já tem períodos, só atualiza status
    await atualizarStatusPeriodos()
    return { existiam: true, gerados: 0 }
  }

  // Não tem períodos, gera
  const gerados = await gerarPeriodosFuncionario(funcionarioId)
  return { existiam: false, gerados }
}

// ============================================
// GARANTIR PERÍODOS PARA TODOS OS ATIVOS
// Útil para rodar uma vez após implantação
// ============================================

export async function garantirPeriodosTodosFuncionariosAtivos(): Promise<{
  funcionario_id: number
  nome: string
  gerados: number
}[]> {
  // Buscar funcionários ativos SEM períodos
  const { data: funcionariosSemPeriodos, error } = await supabase
    .from('funcionarios')
    .select('id, nome_completo')
    .eq('status', 'ativo')
    .not('id', 'in', 
      supabase
        .from('periodos_aquisitivos')
        .select('funcionario_id')
    )

  if (error) {
    // Fallback: buscar todos ativos e verificar um a um
    const { data: todosAtivos, error: erro2 } = await supabase
      .from('funcionarios')
      .select('id, nome_completo')
      .eq('status', 'ativo')

    if (erro2) throw erro2

    const resultados: { funcionario_id: number; nome: string; gerados: number }[] = []

    for (const func of todosAtivos || []) {
      const resultado = await garantirPeriodosFuncionario(func.id)
      if (!resultado.existiam) {
        resultados.push({
          funcionario_id: func.id,
          nome: func.nome_completo,
          gerados: resultado.gerados,
        })
      }
    }

    return resultados
  }

  // Gerar períodos para cada um
  const resultados: { funcionario_id: number; nome: string; gerados: number }[] = []

  for (const func of funcionariosSemPeriodos || []) {
    const gerados = await gerarPeriodosFuncionario(func.id)
    if (gerados > 0) {
      resultados.push({
        funcionario_id: func.id,
        nome: func.nome_completo,
        gerados,
      })
    }
  }

  // Atualizar status de todos
  await atualizarStatusPeriodos()

  return resultados
}

// ============================================
// LISTAR FUNCIONÁRIOS ATIVOS PARA FÉRIAS
// Busca funcionários ativos e garante que tenham períodos
// ============================================

interface FuncionarioParaFerias {
  id: number
  nome_completo: string
  empresa_id: number
  admissao: string
  cargo?: string
  tem_periodos: boolean
  total_saldo: number
}

export async function listarFuncionariosParaFerias(
  empresaId?: number
): Promise<FuncionarioParaFerias[]> {
  // Buscar funcionários ativos
  let query = supabase
    .from('funcionarios')
    .select(`
      id,
      nome_completo,
      empresa_id,
      admissao,
      cargo:cargos(nome)
    `)
    .eq('status', 'ativo')
    .order('nome_completo')

  if (empresaId) {
    query = query.eq('empresa_id', empresaId)
  }

  const { data: funcionarios, error } = await query

  if (error) throw error

  // Para cada funcionário, verificar/gerar períodos e calcular saldo
  const resultado: FuncionarioParaFerias[] = []

  for (const func of funcionarios || []) {
    // Garantir que tem períodos
    const { existiam, gerados } = await garantirPeriodosFuncionario(func.id)

    // Buscar saldo total
    const { data: periodos } = await supabase
      .from('periodos_aquisitivos')
      .select('dias_direito, dias_gozados, dias_vendidos')
      .eq('funcionario_id', func.id)

    const totalSaldo = periodos?.reduce((acc, p) => {
      return acc + (p.dias_direito - p.dias_gozados - p.dias_vendidos)
    }, 0) || 0

    // Supabase pode retornar objeto ou array
    const cargoData = func.cargo
    const cargo = Array.isArray(cargoData) ? cargoData[0] : cargoData
    const cargoNome = typeof cargo === 'object' && cargo ? cargo.nome : undefined

    resultado.push({
      id: func.id,
      nome_completo: func.nome_completo,
      empresa_id: func.empresa_id,
      admissao: func.admissao,
      cargo: cargoNome,
      tem_periodos: existiam || gerados > 0,
      total_saldo: totalSaldo,
    })
  }

  return resultado
}