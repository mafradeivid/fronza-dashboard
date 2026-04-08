// ============================================
// HOOK: USE FERIAS
// Hook principal para gerenciamento de férias
// ============================================

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useEmpresas } from '@/hooks/useEmpresas'
import {
  LancamentoFerias,
  NovoLancamentoFerias,
  FeriasVencendo,
  StatusLancamento,
} from '@/types/ferias'
import {
  EstatisticasFerias,
  // Services
  listarLancamentos,
  buscarLancamento,
  criarLancamento,
  cancelarLancamento,
  buscarFeriasProgramadas,
  buscarFeriasEmAndamento,
  listarFeriasVencendo,
  calcularEstatisticas,
  atualizarStatusAutomatico,
} from '@/services/ferias'

export function useFerias(empresaId?: number | null) {
  // Estado
  const [lancamentos, setLancamentos] = useState<LancamentoFerias[]>([])
  const [feriasProgramadas, setFeriasProgramadas] = useState<LancamentoFerias[]>([])
  const [feriasEmAndamento, setFeriasEmAndamento] = useState<LancamentoFerias[]>([])
  const [feriasVencendo, setFeriasVencendo] = useState<FeriasVencendo[]>([])
  const [estatisticas, setEstatisticas] = useState<EstatisticasFerias | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  // Modal
  const [modalAberto, setModalAberto] = useState(false)
  const [lancamentoEditando, setLancamentoEditando] = useState<LancamentoFerias | null>(null)
  const [salvando, setSalvando] = useState(false)

  // Empresas
  const { empresas } = useEmpresas()

  // ============================================
  // CARREGAMENTO
  // ============================================

  const carregar = useCallback(async () => {
    setCarregando(true)
    setErro(null)

    try {
      // Atualizar status automaticamente (programado -> em_gozo -> concluido)
      await atualizarStatusAutomatico()

      // Carregar dados em paralelo
      const [
        dadosLancamentos,
        dadosProgramadas,
        dadosEmAndamento,
        dadosVencendo,
        dadosEstatisticas,
      ] = await Promise.all([
        listarLancamentos(empresaId ? { empresa_id: empresaId } : undefined),
        buscarFeriasProgramadas(empresaId || undefined, 90), // Próximos 90 dias
        buscarFeriasEmAndamento(empresaId || undefined),
        listarFeriasVencendo(empresaId || undefined),
        calcularEstatisticas(empresaId || undefined),
      ])

      setLancamentos(dadosLancamentos)
      setFeriasProgramadas(dadosProgramadas)
      setFeriasEmAndamento(dadosEmAndamento)
      setFeriasVencendo(dadosVencendo)
      setEstatisticas(dadosEstatisticas)
    } catch (error) {
      console.error('Erro ao carregar férias:', error)
      setErro('Erro ao carregar dados de férias')
    } finally {
      setCarregando(false)
    }
  }, [empresaId])

  useEffect(() => {
    carregar()
  }, [carregar])

  // ============================================
  // MODAL
  // ============================================

  const abrirModalNovo = useCallback(() => {
    setLancamentoEditando(null)
    setModalAberto(true)
  }, [])

  const abrirModalEditar = useCallback(async (lancamentoId: number) => {
    try {
      const lancamento = await buscarLancamento(lancamentoId)
      if (lancamento) {
        setLancamentoEditando(lancamento)
        setModalAberto(true)
      }
    } catch (error) {
      console.error('Erro ao buscar lançamento:', error)
      setErro('Erro ao carregar lançamento')
    }
  }, [])

  const fecharModal = useCallback(() => {
    setModalAberto(false)
    setLancamentoEditando(null)
  }, [])

  // ============================================
  // CRUD
  // ============================================

  const salvarLancamento = useCallback(async (
    dados: NovoLancamentoFerias
  ): Promise<boolean> => {
    setSalvando(true)
    setErro(null)

    try {
      await criarLancamento(dados)
      await carregar()
      fecharModal()
      return true
    } catch (error) {
      console.error('Erro ao salvar lançamento:', error)
      setErro(error instanceof Error ? error.message : 'Erro ao salvar lançamento')
      return false
    } finally {
      setSalvando(false)
    }
  }, [carregar, fecharModal])

  const cancelar = useCallback(async (
    lancamentoId: number,
    motivo?: string
  ): Promise<boolean> => {
    setSalvando(true)
    setErro(null)

    try {
      await cancelarLancamento(lancamentoId, motivo)
      await carregar()
      return true
    } catch (error) {
      console.error('Erro ao cancelar lançamento:', error)
      setErro(error instanceof Error ? error.message : 'Erro ao cancelar lançamento')
      return false
    } finally {
      setSalvando(false)
    }
  }, [carregar])

  // ============================================
  // FILTROS E AGRUPAMENTOS
  // ============================================

  const lancamentosPorStatus = useMemo(() => {
    const grupos: Record<StatusLancamento, LancamentoFerias[]> = {
      programado: [],
      em_gozo: [],
      concluido: [],
      cancelado: [],
    }

    lancamentos.forEach(l => {
      grupos[l.status].push(l)
    })

    return grupos
  }, [lancamentos])

  const alertasCriticos = useMemo(() => {
    return feriasVencendo.filter(f => 
      f.nivel_urgencia === 'critico' || f.nivel_urgencia === 'vencido'
    )
  }, [feriasVencendo])

  // ============================================
  // RETORNO
  // ============================================

  return {
    // Dados
    lancamentos,
    feriasProgramadas,
    feriasEmAndamento,
    feriasVencendo,
    estatisticas,
    empresas,
    carregando,
    erro,

    // Agrupamentos
    lancamentosPorStatus,
    alertasCriticos,

    // Modal
    modalAberto,
    lancamentoEditando,
    salvando,
    abrirModalNovo,
    abrirModalEditar,
    fecharModal,

    // Ações
    salvarLancamento,
    cancelar,
    carregar,
    setErro,
  }
}