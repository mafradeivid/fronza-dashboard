import { useState, useEffect, useCallback } from 'react'
import { Empresa, EMPRESA_INICIAL } from '@/types/pessoas'
import {
  listarEmpresas,
  criarEmpresa,
  atualizarEmpresa,
  excluirEmpresa,
} from '@/services/pessoas'

export function useEmpresas() {
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  
  // Modal
  const [modalAberto, setModalAberto] = useState(false)
  const [empresaEditando, setEmpresaEditando] = useState<Empresa | null>(null)
  const [salvando, setSalvando] = useState(false)

  // Carregar dados
  const carregar = useCallback(async () => {
    setCarregando(true)
    setErro(null)
    try {
      const dados = await listarEmpresas()
      setEmpresas(dados)
    } catch (error) {
      console.error('Erro ao carregar empresas:', error)
      setErro('Erro ao carregar empresas')
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    carregar()
  }, [carregar])

  // Abrir modal para criar
  const abrirModalCriar = useCallback(() => {
    setEmpresaEditando({ ...EMPRESA_INICIAL })
    setModalAberto(true)
  }, [])

  // Abrir modal para editar
  const abrirModalEditar = useCallback((empresa: Empresa) => {
    setEmpresaEditando({ ...empresa })
    setModalAberto(true)
  }, [])

  // Fechar modal
  const fecharModal = useCallback(() => {
    setModalAberto(false)
    setEmpresaEditando(null)
  }, [])

  // Salvar (criar ou atualizar)
  const salvar = useCallback(async (empresa: Empresa): Promise<boolean> => {
    setSalvando(true)
    try {
      if (empresa.id) {
        await atualizarEmpresa(empresa.id, empresa)
      } else {
        await criarEmpresa(empresa)
      }
      await carregar()
      fecharModal()
      return true
    } catch (error) {
      console.error('Erro ao salvar empresa:', error)
      setErro('Erro ao salvar empresa')
      return false
    } finally {
      setSalvando(false)
    }
  }, [carregar, fecharModal])

  // Excluir
  const excluir = useCallback(async (id: number): Promise<boolean> => {
    try {
      await excluirEmpresa(id)
      await carregar()
      return true
    } catch (error) {
      console.error('Erro ao excluir empresa:', error)
      setErro('Erro ao excluir empresa. Verifique se não há funcionários vinculados.')
      return false
    }
  }, [carregar])

  return {
    // Dados
    empresas,
    carregando,
    erro,
    
    // Modal
    modalAberto,
    empresaEditando,
    salvando,
    
    // Ações
    carregar,
    abrirModalCriar,
    abrirModalEditar,
    fecharModal,
    salvar,
    excluir,
    setEmpresaEditando,
    setErro,
  }
}