import { useState, useEffect, useCallback, useMemo } from 'react'
import { Empresa, Setor, Cargo } from '@/types/pessoas'
import { listarFuncionarios, listarEmpresas, listarSetores, listarCargos } from '@/services/pessoas'
import {
  FuncionarioComEncargos,
  calcularEncargosLista,
  gerarResumoEmpresas,
  gerarResumoGeral,
} from '@/services/encargosService'

export function useEncargos() {
  const [funcionariosTodos, setFuncionariosTodos] = useState<FuncionarioComEncargos[]>([])
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [setores, setSetores] = useState<Setor[]>([])
  const [cargos, setCargos] = useState<Cargo[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  
  // Filtros
  const [filtroEmpresa, setFiltroEmpresa] = useState<number | null>(null)
  const [filtroSetor, setFiltroSetor] = useState<string | null>(null)
  const [filtroCargo, setFiltroCargo] = useState<number | null>(null)
  const [filtroBusca, setFiltroBusca] = useState('')

  // Carregar dados
  const carregar = useCallback(async () => {
    setCarregando(true)
    setErro(null)
    try {
      const [dadosFuncionarios, dadosEmpresas, dadosSetores, dadosCargos] = await Promise.all([
        listarFuncionarios(),
        listarEmpresas(),
        listarSetores(),
        listarCargos(),
      ])
      
      const funcionariosComEncargos = calcularEncargosLista(dadosFuncionarios, dadosEmpresas)
      
      setFuncionariosTodos(funcionariosComEncargos)
      setEmpresas(dadosEmpresas)
      setSetores(dadosSetores)
      setCargos(dadosCargos)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      setErro('Erro ao carregar dados')
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    carregar()
  }, [carregar])

  // Funcionários filtrados
  const funcionarios = useMemo(() => {
    let resultado = funcionariosTodos

    if (filtroEmpresa) {
      resultado = resultado.filter(f => f.empresa_id === filtroEmpresa)
    }

    if (filtroSetor) {
      resultado = resultado.filter(f => f.setor_id === filtroSetor)
    }

    if (filtroCargo) {
      resultado = resultado.filter(f => f.cargo_id === filtroCargo)
    }

    if (filtroBusca.trim()) {
      const busca = filtroBusca.toLowerCase().trim()
      resultado = resultado.filter(f => 
        f.nome_completo.toLowerCase().includes(busca) ||
        f.matricula?.toLowerCase().includes(busca)
      )
    }

    return resultado
  }, [funcionariosTodos, filtroEmpresa, filtroSetor, filtroCargo, filtroBusca])

  // Resumo por empresa (dos filtrados)
  const resumoEmpresas = useMemo(() => {
    return gerarResumoEmpresas(funcionarios, empresas)
  }, [funcionarios, empresas])

  // Resumo geral (dos filtrados)
  const resumoGeral = useMemo(() => {
    return gerarResumoGeral(resumoEmpresas)
  }, [resumoEmpresas])

  // Resumo por empresa (TODOS os funcionários, sem filtro)
  const resumoEmpresasTodos = useMemo(() => {
    return gerarResumoEmpresas(funcionariosTodos, empresas)
  }, [funcionariosTodos, empresas])

  // Empresa selecionada (para exibir alíquotas)
  const empresaSelecionada = useMemo(() => {
    if (!filtroEmpresa) return null
    return empresas.find(e => e.id === filtroEmpresa) || null
  }, [filtroEmpresa, empresas])

  // Verificar se tem filtros ativos
  const temFiltrosAtivos = filtroEmpresa || filtroSetor || filtroCargo || filtroBusca.trim()

  // Limpar filtros
  const limparFiltros = () => {
    setFiltroEmpresa(null)
    setFiltroSetor(null)
    setFiltroCargo(null)
    setFiltroBusca('')
  }

  return {
    // Dados
    funcionarios,
    funcionariosTodos,
    empresas,
    setores,
    cargos,
    resumoEmpresas,
    resumoGeral,
    resumoEmpresasTodos,
    empresaSelecionada,
    carregando,
    erro,
    
    // Filtros
    filtroEmpresa,
    filtroSetor,
    filtroCargo,
    filtroBusca,
    setFiltroEmpresa,
    setFiltroSetor,
    setFiltroCargo,
    setFiltroBusca,
    temFiltrosAtivos,
    limparFiltros,
    
    // Ações
    carregar,
    setErro,
  }
}