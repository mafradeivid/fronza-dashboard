import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  VisualizacaoCusto,
  FiltrosCustoPessoal,
  FILTROS_CUSTO_INICIAL,
  DadosCustoPessoal,
} from '@/types/custoPessoal'
import { Empresa, Setor, Cargo, Funcionario } from '@/types/pessoas'
import { calcularCustoPessoal } from '@/services/custoPessoalService'
import { listarEmpresas, listarSetores, listarCargos, listarFuncionarios } from '@/services/pessoas'

export function useCustoPessoal() {
  // Dados calculados
  const [dados, setDados] = useState<DadosCustoPessoal | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  // Listas para os selects
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [setores, setSetores] = useState<Setor[]>([])
  const [cargos, setCargos] = useState<Cargo[]>([])
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([])

  // Filtros
  const [filtros, setFiltros] = useState<FiltrosCustoPessoal>(FILTROS_CUSTO_INICIAL)

  // Visualização atual
  const [visualizacao, setVisualizacao] = useState<VisualizacaoCusto>('consolidado')

  // Funcionário expandido (para visão por funcionário)
  const [funcionarioExpandido, setFuncionarioExpandido] = useState<number | null>(null)

  // Carregar listas para os selects
  const carregarListas = useCallback(async () => {
    try {
      const [emps, sets, cars, funcs] = await Promise.all([
        listarEmpresas(),
        listarSetores(),
        listarCargos(),
        listarFuncionarios(),
      ])
      setEmpresas(emps)
      setSetores(sets)
      setCargos(cars)
      setFuncionarios(funcs)
    } catch (error) {
      console.error('Erro ao carregar listas:', error)
    }
  }, [])

  // Carregar dados de custo
  const carregar = useCallback(async () => {
    setCarregando(true)
    setErro(null)
    try {
      const resultado = await calcularCustoPessoal(filtros)
      setDados(resultado)
    } catch (error) {
      console.error('Erro ao calcular custos:', error)
      setErro('Erro ao calcular custos de pessoal')
    } finally {
      setCarregando(false)
    }
  }, [filtros])

  // Carregar listas na montagem
  useEffect(() => {
    carregarListas()
  }, [carregarListas])

  // Carregar dados quando filtros mudarem
  useEffect(() => {
    carregar()
  }, [carregar])

  // Setores filtrados por empresa
  const setoresFiltrados = useMemo(() => {
    // Setores não têm empresa_id no modelo atual, então retorna todos
    return setores
  }, [setores])

  // Cargos (todos)
  const cargosFiltrados = useMemo(() => {
    return cargos
  }, [cargos])

  // Funcionários filtrados
  const funcionariosFiltrados = useMemo(() => {
    let result = funcionarios

    if (filtros.empresaId) {
      result = result.filter(f => f.empresa_id === filtros.empresaId)
    }
    if (filtros.setorId) {
      result = result.filter(f => f.setor_id === filtros.setorId)
    }
    if (filtros.cargoId) {
      result = result.filter(f => f.cargo_id === filtros.cargoId)
    }

    return result
  }, [funcionarios, filtros.empresaId, filtros.setorId, filtros.cargoId])

  // Atualizar filtro individual
  const atualizarFiltro = useCallback(<K extends keyof FiltrosCustoPessoal>(
    campo: K,
    valor: FiltrosCustoPessoal[K]
  ) => {
    setFiltros(prev => {
      const novosFiltros = { ...prev, [campo]: valor }

      // Limpar filtros dependentes
      if (campo === 'empresaId') {
        novosFiltros.funcionarioId = null
      }
      if (campo === 'setorId') {
        novosFiltros.funcionarioId = null
      }
      if (campo === 'cargoId') {
        novosFiltros.funcionarioId = null
      }

      return novosFiltros
    })
  }, [])

  // Limpar todos os filtros
  const limparFiltros = useCallback(() => {
    setFiltros(prev => ({
      ...prev,
      empresaId: null,
      setorId: null,
      cargoId: null,
      funcionarioId: null,
    }))
  }, [])

  // Verificar se tem filtros de dimensão ativos
  const temFiltrosAtivos = useMemo(() => {
    return !!(filtros.empresaId || filtros.setorId || filtros.cargoId || filtros.funcionarioId)
  }, [filtros])

  // Navegar período (mês anterior / próximo)
  const periodoAnterior = useCallback(() => {
    setFiltros(prev => {
      let novoMesInicio = prev.mesInicio - 1
      let novoAnoInicio = prev.anoInicio
      let novoMesFim = prev.mesFim - 1
      let novoAnoFim = prev.anoFim

      if (novoMesInicio < 1) {
        novoMesInicio = 12
        novoAnoInicio--
      }
      if (novoMesFim < 1) {
        novoMesFim = 12
        novoAnoFim--
      }

      return {
        ...prev,
        mesInicio: novoMesInicio,
        anoInicio: novoAnoInicio,
        mesFim: novoMesFim,
        anoFim: novoAnoFim,
      }
    })
  }, [])

  const periodoProximo = useCallback(() => {
    setFiltros(prev => {
      let novoMesInicio = prev.mesInicio + 1
      let novoAnoInicio = prev.anoInicio
      let novoMesFim = prev.mesFim + 1
      let novoAnoFim = prev.anoFim

      if (novoMesInicio > 12) {
        novoMesInicio = 1
        novoAnoInicio++
      }
      if (novoMesFim > 12) {
        novoMesFim = 1
        novoAnoFim++
      }

      return {
        ...prev,
        mesInicio: novoMesInicio,
        anoInicio: novoAnoInicio,
        mesFim: novoMesFim,
        anoFim: novoAnoFim,
      }
    })
  }, [])

  // Toggle expandir funcionário
  const toggleFuncionarioExpandido = useCallback((funcionarioId: number) => {
    setFuncionarioExpandido(prev => prev === funcionarioId ? null : funcionarioId)
  }, [])

  // Percentuais para os cards de resumo
  const percentuais = useMemo(() => {
    if (!dados?.resumoGeral || dados.resumoGeral.custoTotal === 0) {
      return {
        salarios: 0,
        outrosProventos: 0,
        encargos: 0,
        provisoes: 0,
        extras: 0,
      }
    }

    const total = dados.resumoGeral.custoTotal
    return {
      salarios: (dados.resumoGeral.salarios / total) * 100,
      outrosProventos: (dados.resumoGeral.outrosProventos / total) * 100,
      encargos: (dados.resumoGeral.totalEncargos / total) * 100,
      provisoes: (dados.resumoGeral.totalProvisoes / total) * 100,
      extras: (dados.resumoGeral.pagamentosExtras / total) * 100,
    }
  }, [dados])

  return {
    // Dados
    dados,
    carregando,
    erro,
    setErro,

    // Listas para selects
    empresas,
    setores: setoresFiltrados,
    cargos: cargosFiltrados,
    funcionarios: funcionariosFiltrados,

    // Filtros
    filtros,
    atualizarFiltro,
    limparFiltros,
    temFiltrosAtivos,
    periodoAnterior,
    periodoProximo,

    // Visualização
    visualizacao,
    setVisualizacao,

    // Funcionário expandido
    funcionarioExpandido,
    toggleFuncionarioExpandido,

    // Percentuais
    percentuais,

    // Recarregar
    carregar,
  }
}