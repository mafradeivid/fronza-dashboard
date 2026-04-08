import { useState, useEffect, useCallback, useMemo } from 'react'
import { 
  PagamentoExtra, 
  PAGAMENTO_EXTRA_INICIAL, 
  Funcionario,
  Empresa,
  TipoPagamentoExtra 
} from '@/types/pessoas'
import { 
  listarPagamentosExtras, 
  criarPagamentoExtra, 
  atualizarPagamentoExtra, 
  excluirPagamentoExtra,
  gerarResumoCompetencia,
} from '@/services/pagamentosExtrasService'
import { listarFuncionarios, listarEmpresas } from '@/services/pessoas'

// Tipo para pagamento em lote
export interface PagamentoLoteItem {
  funcionario: Funcionario
  valor: number
  selecionado: boolean
}

export function usePagamentosExtras() {
  // Dados
  const [pagamentos, setPagamentos] = useState<PagamentoExtra[]>([])
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([])
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  // Filtros
  const [filtroCompetenciaMes, setFiltroCompetenciaMes] = useState<number>(new Date().getMonth() + 1)
  const [filtroCompetenciaAno, setFiltroCompetenciaAno] = useState<number>(new Date().getFullYear())
  const [filtroEmpresa, setFiltroEmpresa] = useState<number | null>(null)
  const [filtroFuncionario, setFiltroFuncionario] = useState<number | null>(null)
  const [filtroTipo, setFiltroTipo] = useState<TipoPagamentoExtra | null>(null)
  const [filtroBusca, setFiltroBusca] = useState('')

  // Modal Individual
  const [modalAberto, setModalAberto] = useState(false)
  const [pagamentoEditando, setPagamentoEditando] = useState<PagamentoExtra | null>(null)
  const [salvando, setSalvando] = useState(false)

  // Modal Lote
  const [modalLoteAberto, setModalLoteAberto] = useState(false)
  const [loteItens, setLoteItens] = useState<PagamentoLoteItem[]>([])
  const [loteTipo, setLoteTipo] = useState<TipoPagamentoExtra>('outros')
  const [loteDescricao, setLoteDescricao] = useState<string>('')
  const [loteDataPagamento, setLoteDataPagamento] = useState<string>('')
  const [loteFiltroEmpresa, setLoteFiltroEmpresa] = useState<number | null>(null)
  const [loteBusca, setLoteBusca] = useState('')

  // Carregar dados
  const carregar = useCallback(async () => {
    setCarregando(true)
    setErro(null)
    try {
      const [dadosPagamentos, dadosFuncionarios, dadosEmpresas] = await Promise.all([
        listarPagamentosExtras({
          competencia_mes: filtroCompetenciaMes,
          competencia_ano: filtroCompetenciaAno,
          empresa_id: filtroEmpresa || undefined,
          funcionario_id: filtroFuncionario || undefined,
          
        }),
        listarFuncionarios(),
        listarEmpresas(),
      ])

      setPagamentos(dadosPagamentos)
      setFuncionarios(dadosFuncionarios)
      setEmpresas(dadosEmpresas)
    } catch (error) {
      console.error('Erro ao carregar pagamentos:', error)
      setErro('Erro ao carregar pagamentos')
    } finally {
      setCarregando(false)
    }
  }, [filtroCompetenciaMes, filtroCompetenciaAno, filtroEmpresa, filtroFuncionario, ])

  useEffect(() => {
    carregar()
  }, [carregar])

// Resumo da competência (calculado ANTES do filtro de tipo, para os cards sempre mostrarem os totais)
const resumoCompetencia = useMemo(() => {
  return gerarResumoCompetencia(pagamentos)
}, [pagamentos])

// Pagamentos filtrados por tipo (para a tabela)
const pagamentosFiltradosPorTipo = useMemo(() => {
  if (!filtroTipo) return pagamentos
  return pagamentos.filter(p => p.tipo === filtroTipo)
}, [pagamentos, filtroTipo])

// Pagamentos filtrados por busca
const pagamentosFiltrados = useMemo(() => {
  if (!filtroBusca.trim()) return pagamentosFiltradosPorTipo

  const busca = filtroBusca.toLowerCase().trim()
  return pagamentosFiltradosPorTipo.filter(p => 
    p.funcionario?.nome_completo.toLowerCase().includes(busca) ||
    p.descricao?.toLowerCase().includes(busca)
  )
}, [pagamentosFiltradosPorTipo, filtroBusca])

  // Funcionários filtrados por empresa (para o select do formulário)
  const funcionariosFiltrados = useMemo(() => {
    if (!filtroEmpresa) return funcionarios
    return funcionarios.filter(f => f.empresa_id === filtroEmpresa)
  }, [funcionarios, filtroEmpresa])

  // Funcionários filtrados para o modal de lote
  const funcionariosLoteFiltrados = useMemo(() => {
    let resultado = funcionarios

    if (loteFiltroEmpresa) {
      resultado = resultado.filter(f => f.empresa_id === loteFiltroEmpresa)
    }

    if (loteBusca.trim()) {
      const busca = loteBusca.toLowerCase().trim()
      resultado = resultado.filter(f => 
        f.nome_completo.toLowerCase().includes(busca) ||
        f.matricula?.toLowerCase().includes(busca)
      )
    }

    return resultado
  }, [funcionarios, loteFiltroEmpresa, loteBusca])

  // Modal Individual
  const abrirModalCriar = () => {
    setPagamentoEditando({
      ...PAGAMENTO_EXTRA_INICIAL,
      competencia_mes: filtroCompetenciaMes,
      competencia_ano: filtroCompetenciaAno,
    })
    setModalAberto(true)
  }

  const abrirModalEditar = (pagamento: PagamentoExtra) => {
    setPagamentoEditando({ ...pagamento })
    setModalAberto(true)
  }

  const fecharModal = () => {
    setModalAberto(false)
    setPagamentoEditando(null)
    setErro(null)
  }

  // Modal Lote
  const abrirModalLote = () => {
    // Inicializar lista com todos os funcionários
    const itens: PagamentoLoteItem[] = funcionarios.map(f => ({
      funcionario: f,
      valor: 0,
      selecionado: false,
    }))
    setLoteItens(itens)
    setLoteTipo('outros')
    setLoteDescricao('')
    setLoteDataPagamento('')
    setLoteFiltroEmpresa(null)
    setLoteBusca('')
    setModalLoteAberto(true)
  }

  const fecharModalLote = () => {
    setModalLoteAberto(false)
    setLoteItens([])
    setErro(null)
  }

  const toggleSelecionarFuncionario = (funcionarioId: number) => {
    setLoteItens(prev => prev.map(item => 
      item.funcionario.id === funcionarioId 
        ? { ...item, selecionado: !item.selecionado }
        : item
    ))
  }

  const selecionarTodosFiltrados = () => {
    const idsFiltrados = new Set(funcionariosLoteFiltrados.map(f => f.id))
    setLoteItens(prev => prev.map(item => 
      idsFiltrados.has(item.funcionario.id)
        ? { ...item, selecionado: true }
        : item
    ))
  }

  const deselecionarTodos = () => {
    setLoteItens(prev => prev.map(item => ({ ...item, selecionado: false, valor: 0 })))
  }

  const atualizarValorLote = (funcionarioId: number, valor: number) => {
    setLoteItens(prev => prev.map(item => 
      item.funcionario.id === funcionarioId 
        ? { ...item, valor, selecionado: valor > 0 ? true : item.selecionado }
        : item
    ))
  }

  const aplicarValorParaTodos = (valor: number) => {
    setLoteItens(prev => prev.map(item => 
      item.selecionado ? { ...item, valor } : item
    ))
  }

  // Itens selecionados com valor
  const itensSelecionadosComValor = useMemo(() => {
    return loteItens.filter(item => item.selecionado && item.valor > 0)
  }, [loteItens])

  const totalLote = useMemo(() => {
    return itensSelecionadosComValor.reduce((acc, item) => acc + item.valor, 0)
  }, [itensSelecionadosComValor])

  // CRUD Individual
  const salvar = async (pagamento: PagamentoExtra): Promise<boolean> => {
    setSalvando(true)
    setErro(null)
    try {
      if (pagamento.id) {
        await atualizarPagamentoExtra(pagamento.id, pagamento)
      } else {
        await criarPagamentoExtra(pagamento)
      }
      await carregar()
      fecharModal()
      return true
    } catch (error) {
      console.error('Erro ao salvar pagamento:', error)
      setErro('Erro ao salvar pagamento')
      return false
    } finally {
      setSalvando(false)
    }
  }

  // Salvar Lote
  const salvarLote = async (): Promise<boolean> => {
    if (itensSelecionadosComValor.length === 0) {
      setErro('Selecione pelo menos um funcionário e informe o valor')
      return false
    }

    setSalvando(true)
    setErro(null)
    try {
      // Criar todos os pagamentos em paralelo
       const promises = itensSelecionadosComValor.map(item => 
        criarPagamentoExtra({
          funcionario_id: item.funcionario.id!,
          tipo: loteTipo,
          descricao: loteDescricao || null,
          valor: item.valor,
          competencia_mes: filtroCompetenciaMes,
          competencia_ano: filtroCompetenciaAno,
          data_pagamento: loteDataPagamento || null,
          quantidade_horas: null,
        })
      )

      await Promise.all(promises)
      await carregar()
      fecharModalLote()
      return true
    } catch (error) {
      console.error('Erro ao salvar pagamentos em lote:', error)
      setErro('Erro ao salvar pagamentos em lote')
      return false
    } finally {
      setSalvando(false)
    }
  }

  const excluir = async (id: number): Promise<boolean> => {
    setErro(null)
    try {
      await excluirPagamentoExtra(id)
      await carregar()
      return true
    } catch (error) {
      console.error('Erro ao excluir pagamento:', error)
      setErro('Erro ao excluir pagamento')
      return false
    }
  }

  // Limpar filtros
  const limparFiltros = () => {
    setFiltroEmpresa(null)
    setFiltroFuncionario(null)
    setFiltroTipo(null)
    setFiltroBusca('')
  }

  // Navegar competência
  const competenciaAnterior = () => {
    if (filtroCompetenciaMes === 1) {
      setFiltroCompetenciaMes(12)
      setFiltroCompetenciaAno(filtroCompetenciaAno - 1)
    } else {
      setFiltroCompetenciaMes(filtroCompetenciaMes - 1)
    }
  }

  const competenciaProxima = () => {
    if (filtroCompetenciaMes === 12) {
      setFiltroCompetenciaMes(1)
      setFiltroCompetenciaAno(filtroCompetenciaAno + 1)
    } else {
      setFiltroCompetenciaMes(filtroCompetenciaMes + 1)
    }
  }

  const temFiltrosAtivos = !!(filtroEmpresa || filtroFuncionario || filtroTipo || filtroBusca.trim())

  return {
    // Dados
    pagamentos: pagamentosFiltrados,
    funcionarios,
    funcionariosFiltrados,
    empresas,
    resumoCompetencia,
    carregando,
    erro,

    // Filtros
    filtroCompetenciaMes,
    filtroCompetenciaAno,
    filtroEmpresa,
    filtroFuncionario,
    filtroTipo,
    filtroBusca,
    setFiltroCompetenciaMes,
    setFiltroCompetenciaAno,
    setFiltroEmpresa,
    setFiltroFuncionario,
    setFiltroTipo,
    setFiltroBusca,
    temFiltrosAtivos,
    limparFiltros,
    competenciaAnterior,
    competenciaProxima,

    // Modal Individual
    modalAberto,
    pagamentoEditando,
    salvando,
    abrirModalCriar,
    abrirModalEditar,
    fecharModal,
    setPagamentoEditando,

    // Modal Lote
    modalLoteAberto,
    loteItens,
    loteTipo,
    loteDescricao,
    loteDataPagamento,
    loteFiltroEmpresa,
    loteBusca,
    funcionariosLoteFiltrados,
    itensSelecionadosComValor,
    totalLote,
    setLoteTipo,
    setLoteDescricao,
    setLoteDataPagamento,
    setLoteFiltroEmpresa,
    setLoteBusca,
    abrirModalLote,
    fecharModalLote,
    toggleSelecionarFuncionario,
    selecionarTodosFiltrados,
    deselecionarTodos,
    atualizarValorLote,
    aplicarValorParaTodos,
    salvarLote,

    // CRUD
    salvar,
    excluir,
    carregar,
    setErro,
  }
}