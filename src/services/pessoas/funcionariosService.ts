// ============================================
// SERVICE: FUNCIONÁRIOS
// Com geração automática de períodos de férias
// ============================================

import { supabase } from '@/lib/supabase'
import { Funcionario, StatusFuncionario, DadosDemissao } from '@/types/pessoas'
import { gerarPeriodosFuncionario } from '@/services/ferias'

// Query base com joins
const FUNCIONARIO_SELECT = `
  *,
  empresa:empresas(*),
  cargo:cargos(*),
  setor:setores(*),
  tipo_demissao:tipos_demissao(*)
`

// ============================================
// LISTAGEM
// ============================================

export async function listarFuncionarios(
  filtroStatus?: StatusFuncionario | 'todos'
): Promise<Funcionario[]> {
  let query = supabase
    .from('funcionarios')
    .select(FUNCIONARIO_SELECT)
    .order('nome_completo')

  // Filtro por status (se não for 'todos')
  if (filtroStatus && filtroStatus !== 'todos') {
    query = query.eq('status', filtroStatus)
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

export async function listarFuncionariosAtivos(): Promise<Funcionario[]> {
  return listarFuncionarios('ativo')
}

export async function listarFuncionariosPorEmpresa(
  empresaId: number,
  filtroStatus?: StatusFuncionario | 'todos'
): Promise<Funcionario[]> {
  let query = supabase
    .from('funcionarios')
    .select(FUNCIONARIO_SELECT)
    .eq('empresa_id', empresaId)
    .order('nome_completo')

  if (filtroStatus && filtroStatus !== 'todos') {
    query = query.eq('status', filtroStatus)
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

// Listar funcionários ativos em uma competência específica
export async function listarFuncionariosNaCompetencia(
  mes: number,
  ano: number
): Promise<Funcionario[]> {
  // Primeiro dia da competência
  const primeiroDia = `${ano}-${String(mes).padStart(2, '0')}-01`
  
  const { data, error } = await supabase
    .from('funcionarios')
    .select(FUNCIONARIO_SELECT)
    .or(`data_ultimo_dia.is.null,data_ultimo_dia.gte.${primeiroDia}`)
    .order('nome_completo')

  if (error) throw error
  return data || []
}

// ============================================
// CRUD BÁSICO
// ============================================

export async function buscarFuncionario(id: number): Promise<Funcionario | null> {
  const { data, error } = await supabase
    .from('funcionarios')
    .select(FUNCIONARIO_SELECT)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function criarFuncionario(
  funcionario: Omit<Funcionario, 'id' | 'created_at' | 'updated_at' | 'empresa' | 'cargo' | 'setor' | 'tipo_demissao'>
): Promise<Funcionario> {
  const status = funcionario.status || 'ativo'

  const { data, error } = await supabase
    .from('funcionarios')
    .insert({
      ...funcionario,
      status,
      periodo_experiencia: funcionario.periodo_experiencia || '45+45',
    })
    .select()
    .single()

  if (error) throw error

  // ============================================
  // GERAÇÃO AUTOMÁTICA DE PERÍODOS DE FÉRIAS
  // Se funcionário é ativo, gera os períodos
  // ============================================
  if (status === 'ativo' && data.id) {
    try {
      await gerarPeriodosFuncionario(data.id)
      console.log(`✅ Períodos de férias gerados para funcionário ${data.id}`)
    } catch (erroFerias) {
      // Log do erro mas não interrompe o fluxo
      // O funcionário foi criado, períodos podem ser gerados depois
      console.error(`⚠️ Erro ao gerar períodos de férias para funcionário ${data.id}:`, erroFerias)
    }
  }

  return data
}

export async function atualizarFuncionario(
  id: number, 
  funcionario: Partial<Funcionario>
): Promise<Funcionario> {
  // Buscar funcionário atual para verificar mudança de status
  const funcionarioAtual = await buscarFuncionario(id)
  const statusAnterior = funcionarioAtual?.status
  const novoStatus = funcionario.status

  // Remove campos de relacionamento antes de atualizar
  const dadosParaAtualizar = {
    empresa_id: funcionario.empresa_id,
    nome_completo: funcionario.nome_completo,
    nascimento: funcionario.nascimento,
    matricula: funcionario.matricula,
    cpf: funcionario.cpf,
    admissao: funcionario.admissao,
    cargo_id: funcionario.cargo_id,
    setor_id: funcionario.setor_id,
    salario: funcionario.salario,
    outros_proventos: funcionario.outros_proventos,
    periodo_experiencia: funcionario.periodo_experiencia,
    status: funcionario.status,
    tipo_demissao_id: funcionario.tipo_demissao_id,
    data_desligamento: funcionario.data_desligamento,
    data_ultimo_dia: funcionario.data_ultimo_dia,
    updated_at: new Date().toISOString(),
  }

  // Remove campos undefined
  Object.keys(dadosParaAtualizar).forEach(key => {
    if (dadosParaAtualizar[key as keyof typeof dadosParaAtualizar] === undefined) {
      delete dadosParaAtualizar[key as keyof typeof dadosParaAtualizar]
    }
  })

  const { data, error } = await supabase
    .from('funcionarios')
    .update(dadosParaAtualizar)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  // ============================================
  // GERAÇÃO DE PERÍODOS SE REATIVADO
  // Se mudou de inativo/afastado para ativo
  // ============================================
  if (novoStatus === 'ativo' && statusAnterior !== 'ativo') {
    try {
      await gerarPeriodosFuncionario(id)
      console.log(`✅ Períodos de férias atualizados para funcionário reativado ${id}`)
    } catch (erroFerias) {
      console.error(`⚠️ Erro ao gerar períodos de férias para funcionário ${id}:`, erroFerias)
    }
  }

  return data
}

export async function excluirFuncionario(id: number): Promise<void> {
  const { error } = await supabase
    .from('funcionarios')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// ============================================
// DEMISSÃO
// ============================================

export async function demitirFuncionario(
  id: number,
  dados: DadosDemissao
): Promise<Funcionario> {
  const { data, error } = await supabase
    .from('funcionarios')
    .update({
      status: 'inativo',
      tipo_demissao_id: dados.tipo_demissao_id,
      data_desligamento: dados.data_desligamento,
      data_ultimo_dia: dados.data_ultimo_dia,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function reativarFuncionario(id: number): Promise<Funcionario> {
  const { data, error } = await supabase
    .from('funcionarios')
    .update({
      status: 'ativo',
      tipo_demissao_id: null,
      data_desligamento: null,
      data_ultimo_dia: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  // ============================================
  // GERAÇÃO DE PERÍODOS AO REATIVAR
  // ============================================
  try {
    await gerarPeriodosFuncionario(id)
    console.log(`✅ Períodos de férias gerados para funcionário reativado ${id}`)
  } catch (erroFerias) {
    console.error(`⚠️ Erro ao gerar períodos de férias para funcionário ${id}:`, erroFerias)
  }

  return data
}

export async function afastarFuncionario(id: number): Promise<Funcionario> {
  const { data, error } = await supabase
    .from('funcionarios')
    .update({
      status: 'afastado',
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// ============================================
// ESTATÍSTICAS
// ============================================

export async function contarFuncionariosPorEmpresa(empresaId: number): Promise<number> {
  const { count, error } = await supabase
    .from('funcionarios')
    .select('*', { count: 'exact', head: true })
    .eq('empresa_id', empresaId)
    .eq('status', 'ativo')

  if (error) throw error
  return count || 0
}

export async function somarSalariosPorEmpresa(empresaId: number): Promise<number> {
  const { data, error } = await supabase
    .from('funcionarios')
    .select('salario')
    .eq('empresa_id', empresaId)
    .eq('status', 'ativo')

  if (error) throw error
  return data?.reduce((acc, f) => acc + Number(f.salario), 0) || 0
}

export async function contarPorStatus(): Promise<Record<StatusFuncionario, number>> {
  const { data, error } = await supabase
    .from('funcionarios')
    .select('status')

  if (error) throw error

  const contagem: Record<StatusFuncionario, number> = {
    ativo: 0,
    inativo: 0,
    afastado: 0,
  }

  data?.forEach(f => {
    const status = f.status as StatusFuncionario
    if (contagem[status] !== undefined) {
      contagem[status]++
    }
  })

  return contagem
}