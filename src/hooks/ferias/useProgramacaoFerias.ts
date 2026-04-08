// ============================================
// HOOK: USE PROGRAMACAO FERIAS
// Lista + filtros + ações de programação
// ============================================

import { useState, useEffect, useCallback, useMemo } from 'react'
import { 
  PeriodoParaProgramacao,
  FiltrosProgramacao,
  EstatisticasProgramacao,
  CalculoProgramacao,
} from '@/types/ferias'
import { 
  listarPeriodosParaProgramacao,
  buscarEstatisticasProgramacao,
  calcularProgramacao,
  salvarProgramacao,
} from '@/services/ferias'

const FILTROS_PADRAO: FiltrosProgramacao = {
  empresa_id: undefined,
  situacao: 'todos',
  busca: undefined,
}

export function useProgramacaoFerias() {
  // Estados de dados
  const [periodos, setPeriodos] = useState<PeriodoParaProgramacao[]>([])
  const [estatisticas, setEstatisticas] = useState<EstatisticasProgramacao | null>(null)
  
  // Estados de filtro
  const [filtros, setFiltros] = useState<FiltrosProgramacao>(FILTROS_PADRAO)
  
  // Estados de loading
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [salvando, setSalvando] = useState(false)

  // ============================================
  // CARREGAR DADOS
  // ============================================

  const carregarDados = useCallback(async () => {
    setCarregando(true)
    setErro(null)

    try {
      const [dadosPeriodos, dadosEstatisticas] = await Promise.all([
        listarPeriodosParaProgramacao(filtros),
        buscarEstatisticasProgramacao(filtros.empresa_id),
      ])

      setPeriodos(dadosPeriodos)
      setEstatisticas(dadosEstatisticas)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      setErro('Erro ao carregar dados de férias')
    } finally {
      setCarregando(false)
    }
  }, [filtros])

  // Carregar ao montar e quando filtros mudam
  useEffect(() => {
    carregarDados()
  }, [carregarDados])

  // ============================================
  // AÇÕES DE FILTRO
  // ============================================

  const alterarFiltro = useCallback(<K extends keyof FiltrosProgramacao>(
    campo: K,
    valor: FiltrosProgramacao[K]
  ) => {
    setFiltros(prev => ({ ...prev, [campo]: valor }))
  }, [])

  const limparFiltros = useCallback(() => {
    setFiltros(FILTROS_PADRAO)
  }, [])

  // ============================================
  // CALCULAR PRÉVIA
  // Recebe todos os dados necessários
  // ============================================

  const calcularPrevia = useCallback((
    diasGozo: number,
    diasAbono: number,
    dataInicio: string,
    salario?: number,
    saldo?: number
  ): CalculoProgramacao | null => {
    if (!dataInicio || diasGozo < 1) return null
    if (salario === undefined || saldo === undefined) return null

    return calcularProgramacao(salario, diasGozo, diasAbono, dataInicio, saldo)
  }, [])

  // ============================================
  // PROGRAMAR FÉRIAS
  // Recebe todos os dados necessários
  // ============================================

  const programarFerias = useCallback(async (
    periodoId: number,
    funcionarioId: number,
    dados: { data_inicio: string; dias_gozo: number; dias_abono: number }
  ): Promise<{ sucesso: boolean; erro?: string }> => {
    setSalvando(true)

    try {
      await salvarProgramacao({
        periodo_id: periodoId,
        funcionario_id: funcionarioId,
        data_inicio: dados.data_inicio,
        dias_gozo: dados.dias_gozo,
        dias_abono: dados.dias_abono,
      })

      // Recarregar dados
      await carregarDados()

      return { sucesso: true }
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : 'Erro ao programar férias'
      return { sucesso: false, erro: mensagem }
    } finally {
      setSalvando(false)
    }
  }, [carregarDados])

  // ============================================
  // DADOS DERIVADOS
  // ============================================

  const temAlertas = useMemo(() => {
    if (!estatisticas) return false
    return estatisticas.vencidos > 0 || estatisticas.criticos > 0
  }, [estatisticas])

  // ============================================
  // RETORNO
  // ============================================

  return {
    // Dados
    periodos,
    estatisticas,
    filtros,

    // Estados
    carregando,
    erro,
    salvando,
    temAlertas,

    // Ações de dados
    carregarDados,

    // Ações de filtro
    alterarFiltro,
    limparFiltros,

    // Ações de programação
    calcularPrevia,
    programarFerias,
  }
}