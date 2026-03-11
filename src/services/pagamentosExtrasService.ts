import { supabase } from '@/lib/supabase'
import { PagamentoExtra } from '@/types/pessoas'

// ============================================
// CRUD PAGAMENTOS EXTRAS
// ============================================

/**
 * Lista pagamentos extras com filtros opcionais
 */
export async function listarPagamentosExtras(filtros?: {
  competencia_mes?: number
  competencia_ano?: number
  funcionario_id?: number
  empresa_id?: number
  tipo?: string
}): Promise<PagamentoExtra[]> {
  let query = supabase
    .from('pagamentos_extras')
    .select(`
      *,
      funcionario:funcionarios (
        id,
        nome_completo,
        matricula,
        empresa_id,
        empresa:empresas (id, razao_social),
        cargo:cargos (id, nome),
        setor:setores (id, nome)
      )
    `)
    .order('competencia_ano', { ascending: false })
    .order('competencia_mes', { ascending: false })
    .order('created_at', { ascending: false })

  if (filtros?.competencia_mes) {
    query = query.eq('competencia_mes', filtros.competencia_mes)
  }

  if (filtros?.competencia_ano) {
    query = query.eq('competencia_ano', filtros.competencia_ano)
  }

  if (filtros?.funcionario_id) {
    query = query.eq('funcionario_id', filtros.funcionario_id)
  }

  if (filtros?.tipo) {
    query = query.eq('tipo', filtros.tipo)
  }

  const { data, error } = await query

  if (error) throw error

  // Filtrar por empresa (precisa ser feito após o fetch por causa do join)
  let resultado = data || []
  
  if (filtros?.empresa_id) {
    resultado = resultado.filter(p => p.funcionario?.empresa_id === filtros.empresa_id)
  }

  return resultado
}

/**
 * Busca um pagamento por ID
 */
export async function buscarPagamentoExtra(id: number): Promise<PagamentoExtra | null> {
  const { data, error } = await supabase
    .from('pagamentos_extras')
    .select(`
      *,
      funcionario:funcionarios (
        id,
        nome_completo,
        matricula,
        empresa:empresas (id, razao_social)
      )
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

/**
 * Cria um novo pagamento
 */
export async function criarPagamentoExtra(pagamento: Omit<PagamentoExtra, 'id' | 'created_at' | 'updated_at' | 'funcionario'>): Promise<PagamentoExtra> {
  const { data, error } = await supabase
    .from('pagamentos_extras')
    .insert({
      funcionario_id: pagamento.funcionario_id,
      tipo: pagamento.tipo,
      descricao: pagamento.descricao,
      valor: pagamento.valor,
      competencia_mes: pagamento.competencia_mes,
      competencia_ano: pagamento.competencia_ano,
      data_pagamento: pagamento.data_pagamento,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Atualiza um pagamento existente
 */
export async function atualizarPagamentoExtra(id: number, pagamento: Partial<PagamentoExtra>): Promise<PagamentoExtra> {
  const { data, error } = await supabase
    .from('pagamentos_extras')
    .update({
      funcionario_id: pagamento.funcionario_id,
      tipo: pagamento.tipo,
      descricao: pagamento.descricao,
      valor: pagamento.valor,
      competencia_mes: pagamento.competencia_mes,
      competencia_ano: pagamento.competencia_ano,
      data_pagamento: pagamento.data_pagamento,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Exclui um pagamento
 */
export async function excluirPagamentoExtra(id: number): Promise<void> {
  const { error } = await supabase
    .from('pagamentos_extras')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// ============================================
// RESUMOS E ESTATÍSTICAS
// ============================================

export interface ResumoPorTipo {
  tipo: string
  label: string
  total: number
  quantidade: number
}

export interface ResumoCompetencia {
  competencia_mes: number
  competencia_ano: number
  total: number
  quantidade: number
  porTipo: ResumoPorTipo[]
}

/**
 * Gera resumo de pagamentos por competência
 */
export function gerarResumoCompetencia(pagamentos: PagamentoExtra[]): ResumoCompetencia | null {
  if (pagamentos.length === 0) return null

  const tipos = ['horas_extras', 'bonificacao', 'adiantamento', 'ajuda_custo', 'comissao', 'outros']
  const labels: Record<string, string> = {
    horas_extras: 'Horas Extras',
    bonificacao: 'Bonificação',
    adiantamento: 'Adiantamento',
    ajuda_custo: 'Ajuda de Custo',
    comissao: 'Comissão',
    outros: 'Outros',
  }

  const porTipo: ResumoPorTipo[] = tipos.map(tipo => {
    const pagamentosTipo = pagamentos.filter(p => p.tipo === tipo)
    return {
      tipo,
      label: labels[tipo],
      total: pagamentosTipo.reduce((acc, p) => acc + Number(p.valor), 0),
      quantidade: pagamentosTipo.length,
    }
  }).filter(r => r.quantidade > 0)

  return {
    competencia_mes: pagamentos[0].competencia_mes,
    competencia_ano: pagamentos[0].competencia_ano,
    total: pagamentos.reduce((acc, p) => acc + Number(p.valor), 0),
    quantidade: pagamentos.length,
    porTipo,
  }
}

/**
 * Lista competências disponíveis
 */
export async function listarCompetencias(): Promise<{ mes: number; ano: number }[]> {
  const { data, error } = await supabase
    .from('pagamentos_extras')
    .select('competencia_mes, competencia_ano')
    .order('competencia_ano', { ascending: false })
    .order('competencia_mes', { ascending: false })

  if (error) throw error

  // Remover duplicatas
  const competencias = new Map<string, { mes: number; ano: number }>()
  
  data?.forEach(item => {
    const key = `${item.competencia_ano}-${item.competencia_mes}`
    if (!competencias.has(key)) {
      competencias.set(key, { mes: item.competencia_mes, ano: item.competencia_ano })
    }
  })

  return Array.from(competencias.values())
}