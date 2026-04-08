// ============================================
// HOOK: USE PERIODOS AQUISITIVOS
// Gerenciamento de períodos aquisitivos
// ============================================

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  PeriodoAquisitivoComSaldo,
  FiltrosPeriodos,
  StatusPeriodo,
  NivelUrgencia,
} from '@/types/ferias'
import {
  // Services
  listarPeriodos,
  buscarPeriodo,
  buscarPeriodosFuncionario,
  buscarPeriodosComSaldo,
  gerarPeriodosFuncionario,
  gerarTodosPeriodos,
  atualizarStatusPeriodos,
  atualizarFaltas,
  buscarPeriodosVencendo,
  buscarPeriodosVencidos,
} from '@/services/ferias'

interface UsePeriodosOptions {
  funcionarioId?: number
  empresaId?: number
  status?: StatusPeriodo | StatusPeriodo[]
  apenasComSaldo?: boolean
}

export function usePeriodosAquisitivos(options?: UsePeriodosOptions) {
  // Estado
  const [periodos, setPeriodos] = useState<PeriodoAquisitivoComSaldo[]>([])
  const [periodosVencendo, setPeriodosVencendo] = useState<PeriodoAquisitivoComSaldo[]>([])
  const [periodosVencidos, setPeriodosVencidos] = useState<PeriodoAquisitivoComSaldo[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  // Modal de faltas
  const [modalFaltasAberto, setModalFaltasAberto] = useState(false)
  const [periodoEditandoFaltas, setPeriodoEditandoFaltas] = useState<PeriodoAquisitivoComSaldo | null>(null)
  const [salvando, setSalvando] = useState(false)

  // ============================================
  // CARREGAMENTO
  // ============================================

  const carregar = useCallback(async () => {
    setCarregando(true)
    setErro(null)

    try {
      // Atualizar status dos períodos (em_aquisicao -> adquirido, etc.)
      await atualizarStatusPeriodos()

      // Montar filtros
      const filtros: FiltrosPeriodos = {}
      if (options?.funcionarioId) filtros.funcionario_id = options.funcionarioId
      if (options?.empresaId) filtros.empresa_id = options.empresaId
      if (options?.status) filtros.status = options.status
      if (options?.apenasComSaldo) filtros.apenas_com_saldo = true

      // Carregar dados
      const [dadosPeriodos, dadosVencendo, dadosVencidos] = await Promise.all([
        listarPeriodos(filtros),
        buscarPeriodosVencendo(60, options?.empresaId),
        buscarPeriodosVencidos(options?.empresaId),
      ])

      setPeriodos(dadosPeriodos)
      setPeriodosVencendo(dadosVencendo)
      setPeriodosVencidos(dadosVencidos)
    } catch (error) {
      console.error('Erro ao carregar períodos:', error)
      setErro('Erro ao carregar períodos aquisitivos')
    } finally {
      setCarregando(false)
    }
  }, [options?.funcionarioId, options?.empresaId, options?.status, options?.apenasComSaldo])

  useEffect(() => {
    carregar()
  }, [carregar])

  // ============================================
  // GERAÇÃO DE PERÍODOS
  // ============================================

  const gerarPeriodos = useCallback(async (
    funcionarioId: number
  ): Promise<number> => {
    setSalvando(true)
    setErro(null)

    try {
      const quantidade = await gerarPeriodosFuncionario(funcionarioId)
      await carregar()
      return quantidade
    } catch (error) {
      console.error('Erro ao gerar períodos:', error)
      setErro('Erro ao gerar períodos')
      return 0
    } finally {
      setSalvando(false)
    }
  }, [carregar])

  const gerarTodos = useCallback(async (): Promise<{
    funcionario_id: number
    nome: string
    periodos_criados: number
  }[]> => {
    setSalvando(true)
    setErro(null)

    try {
      const resultado = await gerarTodosPeriodos()
      await carregar()
      return resultado
    } catch (error) {
      console.error('Erro ao gerar todos os períodos:', error)
      setErro('Erro ao gerar períodos')
      return []
    } finally {
      setSalvando(false)
    }
  }, [carregar])

  // ============================================
  // FALTAS
  // ============================================

  const abrirModalFaltas = useCallback((periodo: PeriodoAquisitivoComSaldo) => {
    setPeriodoEditandoFaltas(periodo)
    setModalFaltasAberto(true)
  }, [])

  const fecharModalFaltas = useCallback(() => {
    setModalFaltasAberto(false)
    setPeriodoEditandoFaltas(null)
  }, [])

  const salvarFaltas = useCallback(async (
    periodoId: number,
    faltas: number
  ): Promise<boolean> => {
    setSalvando(true)
    setErro(null)

    try {
      await atualizarFaltas(periodoId, faltas)
      await carregar()
      fecharModalFaltas()
      return true
    } catch (error) {
      console.error('Erro ao salvar faltas:', error)
      setErro('Erro ao salvar faltas')
      return false
    } finally {
      setSalvando(false)
    }
  }, [carregar, fecharModalFaltas])

  // ============================================
  // AGRUPAMENTOS
  // ============================================

  const periodosPorStatus = useMemo(() => {
    const grupos: Record<StatusPeriodo, PeriodoAquisitivoComSaldo[]> = {
      em_aquisicao: [],
      adquirido: [],
      parcial: [],
      quitado: [],
      vencido: [],
    }

    periodos.forEach(p => {
      grupos[p.status].push(p)
    })

    return grupos
  }, [periodos])

  const periodosPorUrgencia = useMemo(() => {
    const grupos: Record<NivelUrgencia, PeriodoAquisitivoComSaldo[]> = {
      ok: [],
      atencao: [],
      alerta: [],
      critico: [],
      vencido: [],
    }

    periodos.forEach(p => {
      grupos[p.nivel_urgencia].push(p)
    })

    return grupos
  }, [periodos])

  // Estatísticas
  const totais = useMemo(() => ({
    total: periodos.length,
    emAquisicao: periodosPorStatus.em_aquisicao.length,
    adquiridos: periodosPorStatus.adquirido.length,
    parciais: periodosPorStatus.parcial.length,
    quitados: periodosPorStatus.quitado.length,
    vencidos: periodosPorStatus.vencido.length,
    criticos: periodosPorUrgencia.critico.length,
    comAlerta: periodosPorUrgencia.alerta.length + periodosPorUrgencia.critico.length,
    diasDisponiveis: periodos.reduce((acc, p) => acc + p.dias_saldo, 0),
  }), [periodos, periodosPorStatus, periodosPorUrgencia])

  // ============================================
  // HELPERS
  // ============================================

  const buscarPorFuncionario = useCallback(async (
    funcionarioId: number
  ): Promise<PeriodoAquisitivoComSaldo[]> => {
    return buscarPeriodosFuncionario(funcionarioId)
  }, [])

  const buscarComSaldo = useCallback(async (
    funcionarioId: number
  ): Promise<PeriodoAquisitivoComSaldo[]> => {
    return buscarPeriodosComSaldo(funcionarioId)
  }, [])

  // ============================================
  // RETORNO
  // ============================================

  return {
    // Dados
    periodos,
    periodosVencendo,
    periodosVencidos,
    carregando,
    erro,

    // Agrupamentos
    periodosPorStatus,
    periodosPorUrgencia,
    totais,

    // Modal de Faltas
    modalFaltasAberto,
    periodoEditandoFaltas,
    salvando,
    abrirModalFaltas,
    fecharModalFaltas,
    salvarFaltas,

    // Ações
    carregar,
    gerarPeriodos,
    gerarTodos,
    buscarPorFuncionario,
    buscarComSaldo,
    setErro,
  }
}