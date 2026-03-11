// ============================================
// HOOK: USE FUNCIONARIOS
// Com filtro de status e funções de demissão
// ============================================

import { useState, useEffect, useCallback } from 'react'
import { 
  Funcionario, 
  Empresa, 
  Setor, 
  Cargo, 
  TipoDemissao,
  StatusFuncionario,
  DadosDemissao,
  FUNCIONARIO_INICIAL,
} from '@/types/pessoas'
import {
  listarFuncionarios,
  criarFuncionario,
  atualizarFuncionario,
  excluirFuncionario,
  demitirFuncionario,
  reativarFuncionario,
  listarEmpresas,
  listarSetores,
  listarCargos,
  listarTiposDemissao,
} from '@/services/pessoas'

type FiltroStatus = StatusFuncionario | 'todos'

export function useFuncionarios() {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([])
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [setores, setSetores] = useState<Setor[]>([])
  const [cargos, setCargos] = useState<Cargo[]>([])
  const [tiposDemissao, setTiposDemissao] = useState<TipoDemissao[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  
  // Filtros
  const [filtroEmpresa, setFiltroEmpresa] = useState<number | null>(null)
  const [filtroSetor, setFiltroSetor] = useState<string | null>(null)
  const [filtroCargo, setFiltroCargo] = useState<number | null>(null)
  const [filtroStatus, setFiltroStatus] = useState<FiltroStatus>('ativo')
  const [filtroBusca, setFiltroBusca] = useState('')
  
  // Modal de Edição
  const [modalAberto, setModalAberto] = useState(false)
  const [funcionarioEditando, setFuncionarioEditando] = useState<Funcionario | null>(null)
  const [salvando, setSalvando] = useState(false)

  // Modal de Demissão
  const [modalDemissaoAberto, setModalDemissaoAberto] = useState(false)
  const [funcionarioDemitindo, setFuncionarioDemitindo] = useState<Funcionario | null>(null)

  // Carregar dados
  const carregar = useCallback(async () => {
    setCarregando(true)
    setErro(null)
    try {
      const [
        dadosFuncionarios, 
        dadosEmpresas, 
        dadosSetores, 
        dadosCargos,
        dadosTiposDemissao,
      ] = await Promise.all([
        listarFuncionarios(filtroStatus),
        listarEmpresas(),
        listarSetores(),
        listarCargos(),
        listarTiposDemissao(),
      ])
      setFuncionarios(dadosFuncionarios)
      setEmpresas(dadosEmpresas)
      setSetores(dadosSetores)
      setCargos(dadosCargos)
      setTiposDemissao(dadosTiposDemissao)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      setErro('Erro ao carregar dados')
    } finally {
      setCarregando(false)
    }
  }, [filtroStatus])

  useEffect(() => {
    carregar()
  }, [carregar])

  // Funcionários filtrados
  const funcionariosFiltrados = funcionarios.filter(f => {
    if (filtroEmpresa && f.empresa_id !== filtroEmpresa) return false
    if (filtroSetor && f.setor_id !== filtroSetor) return false
    if (filtroCargo && f.cargo_id !== filtroCargo) return false
    if (filtroBusca) {
      const busca = filtroBusca.toLowerCase()
      const nomeMatch = f.nome_completo.toLowerCase().includes(busca)
      const matriculaMatch = f.matricula?.toLowerCase().includes(busca)
      if (!nomeMatch && !matriculaMatch) return false
    }
    return true
  })

  // ============================================
  // MODAL DE EDIÇÃO
  // ============================================

  const abrirModalCriar = useCallback(() => {
    setFuncionarioEditando({ ...FUNCIONARIO_INICIAL })
    setModalAberto(true)
  }, [])

  const abrirModalEditar = useCallback((funcionario: Funcionario) => {
    setFuncionarioEditando({ ...funcionario })
    setModalAberto(true)
  }, [])

  const fecharModal = useCallback(() => {
    setModalAberto(false)
    setFuncionarioEditando(null)
  }, [])

  const salvar = useCallback(async (funcionario: Funcionario): Promise<boolean> => {
    setSalvando(true)
    try {
      if (funcionario.id) {
        await atualizarFuncionario(funcionario.id, funcionario)
      } else {
        await criarFuncionario(funcionario)
      }
      await carregar()
      fecharModal()
      return true
    } catch (error) {
      console.error('Erro ao salvar funcionário:', error)
      setErro('Erro ao salvar funcionário')
      return false
    } finally {
      setSalvando(false)
    }
  }, [carregar, fecharModal])

  const excluir = useCallback(async (id: number): Promise<boolean> => {
    try {
      await excluirFuncionario(id)
      await carregar()
      return true
    } catch (error) {
      console.error('Erro ao excluir funcionário:', error)
      setErro('Erro ao excluir funcionário')
      return false
    }
  }, [carregar])

  // ============================================
  // MODAL DE DEMISSÃO
  // ============================================

  const abrirModalDemissao = useCallback((funcionario: Funcionario) => {
    setFuncionarioDemitindo(funcionario)
    setModalDemissaoAberto(true)
  }, [])

  const fecharModalDemissao = useCallback(() => {
    setModalDemissaoAberto(false)
    setFuncionarioDemitindo(null)
  }, [])

  const confirmarDemissao = useCallback(async (dados: DadosDemissao): Promise<boolean> => {
    if (!funcionarioDemitindo?.id) return false

    setSalvando(true)
    try {
      await demitirFuncionario(funcionarioDemitindo.id, dados)
      await carregar()
      fecharModalDemissao()
      return true
    } catch (error) {
      console.error('Erro ao demitir funcionário:', error)
      setErro('Erro ao registrar demissão')
      return false
    } finally {
      setSalvando(false)
    }
  }, [funcionarioDemitindo, carregar, fecharModalDemissao])

  const reativar = useCallback(async (id: number): Promise<boolean> => {
    setSalvando(true)
    try {
      await reativarFuncionario(id)
      await carregar()
      return true
    } catch (error) {
      console.error('Erro ao reativar funcionário:', error)
      setErro('Erro ao reativar funcionário')
      return false
    } finally {
      setSalvando(false)
    }
  }, [carregar])

  // ============================================
  // FILTROS
  // ============================================

  const limparFiltros = useCallback(() => {
    setFiltroEmpresa(null)
    setFiltroSetor(null)
    setFiltroCargo(null)
    setFiltroBusca('')
    // Não limpa filtroStatus - mantém a seleção
  }, [])

  const temFiltrosAtivos = !!(filtroEmpresa || filtroSetor || filtroCargo || filtroBusca.trim())

  // ============================================
  // ESTATÍSTICAS
  // ============================================

  const totalFuncionarios = funcionariosFiltrados.length
  const totalSalarios = funcionariosFiltrados.reduce((acc, f) => acc + Number(f.salario), 0)

  // Contagem por status (do total, não filtrado)
  const contagemPorStatus = {
    ativos: funcionarios.filter(f => f.status === 'ativo').length,
    inativos: funcionarios.filter(f => f.status === 'inativo').length,
    afastados: funcionarios.filter(f => f.status === 'afastado').length,
  }

  return {
    // Dados
    funcionarios: funcionariosFiltrados,
    todosOsFuncionarios: funcionarios,
    empresas,
    setores,
    cargos,
    tiposDemissao,
    carregando,
    erro,
    
    // Filtros
    filtroEmpresa,
    filtroSetor,
    filtroCargo,
    filtroStatus,
    filtroBusca,
    setFiltroEmpresa,
    setFiltroSetor,
    setFiltroCargo,
    setFiltroStatus,
    setFiltroBusca,
    limparFiltros,
    temFiltrosAtivos,
    
    // Modal de Edição
    modalAberto,
    funcionarioEditando,
    salvando,
    abrirModalCriar,
    abrirModalEditar,
    fecharModal,
    salvar,
    excluir,
    setFuncionarioEditando,

    // Modal de Demissão
    modalDemissaoAberto,
    funcionarioDemitindo,
    abrirModalDemissao,
    fecharModalDemissao,
    confirmarDemissao,
    reativar,
    
    // Estatísticas
    totalFuncionarios,
    totalSalarios,
    contagemPorStatus,
    
    // Utilitários
    setErro,
    carregar,
  }
}