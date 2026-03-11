import { useState, useEffect, useCallback } from 'react'
import { Cargo, CARGO_INICIAL } from '@/types/pessoas'
import {
  listarCargos,
  criarCargo,
  atualizarCargo,
  excluirCargo,
} from '@/services/pessoas'

export function useCargos() {
  const [cargos, setCargos] = useState<Cargo[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  
  // Modal
  const [modalAberto, setModalAberto] = useState(false)
  const [cargoEditando, setCargoEditando] = useState<Cargo | null>(null)
  const [salvando, setSalvando] = useState(false)

  // Carregar dados
  const carregar = useCallback(async () => {
    setCarregando(true)
    setErro(null)
    try {
      const dados = await listarCargos()
      setCargos(dados)
    } catch (error) {
      console.error('Erro ao carregar cargos:', error)
      setErro('Erro ao carregar cargos')
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    carregar()
  }, [carregar])

  // Abrir modal para criar
  const abrirModalCriar = useCallback(() => {
    setCargoEditando({ ...CARGO_INICIAL })
    setModalAberto(true)
  }, [])

  // Abrir modal para editar
  const abrirModalEditar = useCallback((cargo: Cargo) => {
    setCargoEditando({ ...cargo })
    setModalAberto(true)
  }, [])

  // Fechar modal
  const fecharModal = useCallback(() => {
    setModalAberto(false)
    setCargoEditando(null)
  }, [])

  // Salvar (criar ou atualizar)
  const salvar = useCallback(async (cargo: Cargo): Promise<boolean> => {
    setSalvando(true)
    try {
      if (cargo.id) {
        await atualizarCargo(cargo.id, cargo)
      } else {
        await criarCargo(cargo)
      }
      await carregar()
      fecharModal()
      return true
    } catch (error) {
      console.error('Erro ao salvar cargo:', error)
      setErro('Erro ao salvar cargo')
      return false
    } finally {
      setSalvando(false)
    }
  }, [carregar, fecharModal])

  // Excluir
  const excluir = useCallback(async (id: number): Promise<boolean> => {
    try {
      await excluirCargo(id)
      await carregar()
      return true
    } catch (error) {
      console.error('Erro ao excluir cargo:', error)
      setErro('Erro ao excluir cargo. Verifique se não há funcionários vinculados.')
      return false
    }
  }, [carregar])

  return {
    // Dados
    cargos,
    carregando,
    erro,
    
    // Modal
    modalAberto,
    cargoEditando,
    salvando,
    
    // Ações
    carregar,
    abrirModalCriar,
    abrirModalEditar,
    fecharModal,
    salvar,
    excluir,
    setCargoEditando,
    setErro,
  }
}