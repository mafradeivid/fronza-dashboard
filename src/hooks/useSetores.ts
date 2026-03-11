import { useState, useEffect, useCallback } from 'react'
import { Setor, SETOR_INICIAL } from '@/types/pessoas'
import {
  listarSetores,
  criarSetor,
  atualizarSetor,
  excluirSetor, 
} from '@/services/pessoas'

export function useSetores() {
  const [setores, setSetores] = useState<Setor[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  
  // Modal
  const [modalAberto, setModalAberto] = useState(false)
  const [setorEditando, setSetorEditando] = useState<Setor | null>(null)
  const [salvando, setSalvando] = useState(false)

  // Carregar dados
  const carregar = useCallback(async () => {
    setCarregando(true)
    setErro(null)
    try {
      const dados = await listarSetores()
      setSetores(dados)
    } catch (error) {
      console.error('Erro ao carregar setores:', error)
      setErro('Erro ao carregar setores')
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    carregar()
  }, [carregar])

  // Abrir modal para criar
  const abrirModalCriar = useCallback(() => {
    setSetorEditando({ ...SETOR_INICIAL })
    setModalAberto(true)
  }, [])

  // Abrir modal para editar
  const abrirModalEditar = useCallback((setor: Setor) => {
    setSetorEditando({ ...setor })
    setModalAberto(true)
  }, [])

  // Fechar modal
  const fecharModal = useCallback(() => {
    setModalAberto(false)
    setSetorEditando(null)
  }, [])

  // Salvar (criar ou atualizar)
  const salvar = useCallback(async (setor: Setor): Promise<boolean> => {
    setSalvando(true)
    try {
      if (setor.id) {
        await atualizarSetor(setor.id, setor)
      } else {
        await criarSetor(setor)
      }
      await carregar()
      fecharModal()
      return true
    } catch (error) {
      console.error('Erro ao salvar setor:', error)
      setErro('Erro ao salvar setor')
      return false
    } finally {
      setSalvando(false)
    }
  }, [carregar, fecharModal])

  // Excluir
  const excluir = useCallback(async (id: string): Promise<boolean> => {
    try {
      await excluirSetor(id)
      await carregar()
      return true
    } catch (error) {
      console.error('Erro ao excluir setor:', error)
      setErro('Erro ao excluir setor. Verifique se não há funcionários vinculados.')
      return false
    }
  }, [carregar])

  return {
    // Dados
    setores,
    carregando,
    erro,
    
    // Modal
    modalAberto,
    setorEditando,
    salvando,
    
    // Ações
    carregar,
    abrirModalCriar,
    abrirModalEditar,
    fecharModal,
    salvar,
    excluir,
    setSetorEditando,
    setErro,
  }
}