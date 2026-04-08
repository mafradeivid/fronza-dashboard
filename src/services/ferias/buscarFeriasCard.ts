// ============================================
// BUSCAR FÉRIAS PARA CARD VISÃO GERAL
// ============================================

import { supabase } from '@/lib/supabase'

type TipoFerias = 'em_gozo' | 'programada' | 'retornando'

export interface FuncionarioFerias {
  id: number
  nome_completo: string
  empresa_nome: string
  data_inicio: string
  data_fim: string
  dias_gozados: number
  tipo: TipoFerias
  diasRestantes: number
}

/**
 * Busca férias para exibição no card da Visão Geral
 * Retorna: em gozo, programadas (próximos 30 dias), retornando (próximos 7 dias)
 */
export async function buscarFeriasParaCard(
  empresaId?: number | null
): Promise<FuncionarioFerias[]> {
  const hoje = new Date()
  const hojeStr = hoje.toISOString().split('T')[0]
  
  // Data limite para programadas (próximos 30 dias)
  const limite30 = new Date(hoje)
  limite30.setDate(limite30.getDate() + 30)
  const limite30Str = limite30.toISOString().split('T')[0]

  // Data limite para retornando (próximos 7 dias)
  const limite7 = new Date(hoje)
  limite7.setDate(limite7.getDate() + 7)
  const limite7Str = limite7.toISOString().split('T')[0]

  // Query base
  let query = supabase
    .from('lancamentos_ferias')
    .select(`
      id,
      data_inicio,
      data_fim,
      dias_gozados,
      status,
      funcionario:funcionarios!inner (
        id,
        nome_completo,
        empresa_id,
        empresa:empresas (
          razao_social
        )
      )
    `)
    .in('status', ['programado', 'em_gozo'])
    .order('data_inicio', { ascending: true })

  // Filtrar: em_gozo OU programadas nos próximos 30 dias
  query = query.or(`status.eq.em_gozo,and(status.eq.programado,data_inicio.lte.${limite30Str})`)

  const { data, error } = await query

  if (error) {
    console.error('Erro ao buscar férias para card:', error)
    return []
  }

  const resultado: FuncionarioFerias[] = []

  for (const item of data || []) {
    // Supabase pode retornar objeto ou array
    const funcData = item.funcionario
    const func = Array.isArray(funcData) ? funcData[0] : funcData
    
    if (!func) continue

    // Filtrar por empresa se necessário
    if (empresaId && func.empresa_id !== empresaId) continue

    const empresaData = func.empresa
    const empresa = Array.isArray(empresaData) ? empresaData[0] : empresaData

    const dataInicio = new Date(item.data_inicio)
    const dataFim = new Date(item.data_fim)
    
    // Calcular tipo e dias restantes
    let tipo: TipoFerias
    let diasRestantes: number

    if (item.status === 'em_gozo') {
      // Calcular dias para retorno
      const diffRetorno = Math.ceil((dataFim.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
      
      if (diffRetorno <= 7 && diffRetorno >= 0) {
        tipo = 'retornando'
        diasRestantes = diffRetorno
      } else {
        tipo = 'em_gozo'
        diasRestantes = diffRetorno > 0 ? diffRetorno : 0
      }
    } else {
      // Programada - calcular dias para iniciar
      tipo = 'programada'
      diasRestantes = Math.ceil((dataInicio.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
      if (diasRestantes < 0) diasRestantes = 0
    }

    resultado.push({
      id: item.id,
      nome_completo: func.nome_completo || '',
      empresa_nome: empresa?.razao_social || '',
      data_inicio: item.data_inicio,
      data_fim: item.data_fim,
      dias_gozados: item.dias_gozados,
      tipo,
      diasRestantes,
    })
  }

  // Ordenar: em_gozo/retornando primeiro, depois programadas
  return resultado.sort((a, b) => {
    const ordemTipo = { em_gozo: 0, retornando: 1, programada: 2 }
    if (ordemTipo[a.tipo] !== ordemTipo[b.tipo]) {
      return ordemTipo[a.tipo] - ordemTipo[b.tipo]
    }
    return a.diasRestantes - b.diasRestantes
  })
}