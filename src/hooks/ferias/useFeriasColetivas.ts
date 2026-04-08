// ============================================
// HOOK: USE FERIAS COLETIVAS
// Gerenciamento de férias coletivas
// ============================================

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useEmpresas } from '@/hooks/useEmpresas'
import {
  FeriasColetivas,
  NovasFeriasColetivas,
  StatusFeriasColetivas,
} from '@/types/ferias'
import {
  // Services
  listarFeriasColetivas,
  buscarFeriasColetivas,
  programarFeriasColetivas,
  iniciarFeriasColetivas,
  concluirFeriasColetivas,
  cancelarFeriasColetivas,
  adicionarFuncionario,
  removerFuncionario,
  buscarProximasFeriasColetivas,
} from '@/services/ferias'

interface UseFeriasColetvasOptions {
  empresaId?: number
  ano?: number
}

export function useFeriasColetivas(options?: UseFeriasColetvasOptions) {
  // Estado
  const [feriasColetivas, setFeriasColetivas] = useState<FeriasColetivas[]>([])
  const [proximasFerias, setProximasFerias] = useState<FeriasColetivas[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  // Modal
  const [modalAberto, setModalAberto] = useState(false)
  const [feriasEditando, setFeriasEditando] = useState<FeriasColetivas | null>(null)
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
      const [dadosColetivas, dadosProximas] = await Promise.all([
        listarFeriasColetivas(options?.empresaId, options?.ano),
        buscarProximasFeriasColetivas(options?.empresaId, 90),
      ])

      setFeriasColetivas(dadosColetivas)
      setProximasFerias(dadosProximas)
    } catch (error) {
      console.error('Erro ao carregar férias coletivas:', error)
      setErro('Erro ao carregar férias coletivas')
    } finally {
      setCarregando(false)
    }
  }, [options?.empresaId, options?.ano])

  useEffect(() => {
    carregar()
  }, [carregar])

  // ============================================
  // MODAL
  // ============================================

  const abrirModalNovo = useCallback(() => {
    setFeriasEditando(null)
    setModalAberto(true)
  }, [])

  const abrirModalEditar = useCallback(async (id: number) => {
    try {
      const ferias = await buscarFeriasColetivas(id)
      if (ferias) {
        setFeriasEditando(ferias)
        setModalAberto(true)
      }
    } catch (error) {
      console.error('Erro ao buscar férias coletivas:', error)
      setErro('Erro ao carregar férias coletivas')
    }
  }, [])

  const fecharModal = useCallback(() => {
    setModalAberto(false)
    setFeriasEditando(null)
  }, [])

  // ============================================
  // CRUD
  // ============================================

  const programar = useCallback(async (
    dados: NovasFeriasColetivas
  ): Promise<boolean> => {
    setSalvando(true)
    setErro(null)

    try {
      await programarFeriasColetivas(dados)
      await carregar()
      fecharModal()
      return true
    } catch (error) {
      console.error('Erro ao programar férias coletivas:', error)
      setErro(error instanceof Error ? error.message : 'Erro ao programar férias coletivas')
      return false
    } finally {
      setSalvando(false)
    }
  }, [carregar, fecharModal])

  const iniciar = useCallback(async (id: number): Promise<boolean> => {
    setSalvando(true)
    setErro(null)

    try {
      await iniciarFeriasColetivas(id)
      await carregar()
      return true
    } catch (error) {
      console.error('Erro ao iniciar férias coletivas:', error)
      setErro(error instanceof Error ? error.message : 'Erro ao iniciar férias coletivas')
      return false
    } finally {
      setSalvando(false)
    }
  }, [carregar])

  const concluir = useCallback(async (id: number): Promise<boolean> => {
    setSalvando(true)
    setErro(null)

    try {
      await concluirFeriasColetivas(id)
      await carregar()
      return true
    } catch (error) {
      console.error('Erro ao concluir férias coletivas:', error)
      setErro(error instanceof Error ? error.message : 'Erro ao concluir férias coletivas')
      return false
    } finally {
      setSalvando(false)
    }
  }, [carregar])

  const cancelar = useCallback(async (
    id: number,
    motivo?: string
  ): Promise<boolean> => {
    setSalvando(true)
    setErro(null)

    try {
      await cancelarFeriasColetivas(id, motivo)
      await carregar()
      return true
    } catch (error) {
      console.error('Erro ao cancelar férias coletivas:', error)
      setErro(error instanceof Error ? error.message : 'Erro ao cancelar férias coletivas')
      return false
    } finally {
      setSalvando(false)
    }
  }, [carregar])

  // ============================================
  // FUNCIONÁRIOS
  // ============================================

  const adicionarFunc = useCallback(async (
    feriasId: number,
    funcionarioId: number
  ): Promise<boolean> => {
    setSalvando(true)
    setErro(null)

    try {
      await adicionarFuncionario(feriasId, funcionarioId)
      await carregar()
      return true
    } catch (error) {
      console.error('Erro ao adicionar funcionário:', error)
      setErro(error instanceof Error ? error.message : 'Erro ao adicionar funcionário')
      return false
    } finally {
      setSalvando(false)
    }
  }, [carregar])

  const removerFunc = useCallback(async (
    feriasId: number,
    funcionarioId: number
  ): Promise<boolean> => {
    setSalvando(true)
    setErro(null)

    try {
      await removerFuncionario(feriasId, funcionarioId)
      await carregar()
      return true
    } catch (error) {
      console.error('Erro ao remover funcionário:', error)
      setErro(error instanceof Error ? error.message : 'Erro ao remover funcionário')
      return false
    } finally {
      setSalvando(false)
    }
  }, [carregar])

  // ============================================
  // AGRUPAMENTOS
  // ============================================

  const coletvasPorStatus = useMemo(() => {
    const grupos: Record<StatusFeriasColetivas, FeriasColetivas[]> = {
      programada: [],
      em_andamento: [],
      concluida: [],
      cancelada: [],
    }

    feriasColetivas.forEach(f => {
      grupos[f.status].push(f)
    })

    return grupos
  }, [feriasColetivas])

  const totais = useMemo(() => ({
    total: feriasColetivas.length,
    programadas: coletvasPorStatus.programada.length,
    emAndamento: coletvasPorStatus.em_andamento.length,
    concluidas: coletvasPorStatus.concluida.length,
    canceladas: coletvasPorStatus.cancelada.length,
  }), [feriasColetivas, coletvasPorStatus])

  // ============================================
  // RETORNO
  // ============================================

  return {
    // Dados
    feriasColetivas,
    proximasFerias,
    empresas,
    carregando,
    erro,

    // Agrupamentos
    coletvasPorStatus,
    totais,

    // Modal
    modalAberto,
    feriasEditando,
    salvando,
    abrirModalNovo,
    abrirModalEditar,
    fecharModal,

    // Ações
    programar,
    iniciar,
    concluir,
    cancelar,
    adicionarFunc,
    removerFunc,
    carregar,
    setErro,
  }
}