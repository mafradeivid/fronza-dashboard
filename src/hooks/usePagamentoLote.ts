import { useState, useMemo, useCallback } from 'react'
import { Funcionario, Empresa, TipoPagamentoExtra } from '@/types/pessoas'
import { criarPagamentoExtra } from '@/services/pagamentosExtrasService'

export interface PagamentoLoteItem {
  funcionario: Funcionario
  valor: number
  quantidadeHoras: string
  selecionado: boolean
}

interface UsePagamentoLoteProps {
  funcionarios: Funcionario[]
  empresas: Empresa[]
  competenciaMes: number
  competenciaAno: number
  onSucesso: () => void
}

export function usePagamentoLote({
  funcionarios,
  empresas,
  competenciaMes,
  competenciaAno,
  onSucesso,
}: UsePagamentoLoteProps) {
  // Modal
  const [modalAberto, setModalAberto] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  // Configurações do lote
  const [tipo, setTipo] = useState<TipoPagamentoExtra>('outros')
  const [descricao, setDescricao] = useState('')
  const [dataPagamento, setDataPagamento] = useState('')
  const [quantidadeHorasGlobal, setQuantidadeHorasGlobal] = useState('')

  // Filtros do modal
  const [filtroEmpresa, setFiltroEmpresa] = useState<number | null>(null)
  const [busca, setBusca] = useState('')

  // Itens
  const [itens, setItens] = useState<PagamentoLoteItem[]>([])

  // Valores de texto para inputs
  const [valoresTexto, setValoresTexto] = useState<Map<number, string>>(new Map())

  // Abrir modal
  const abrir = useCallback(() => {
    const novosItens: PagamentoLoteItem[] = funcionarios.map(f => ({
      funcionario: f,
      valor: 0,
      quantidadeHoras: '',
      selecionado: false,
    }))
    setItens(novosItens)
    setTipo('outros')
    setDescricao('')
    setDataPagamento('')
    setQuantidadeHorasGlobal('')
    setFiltroEmpresa(null)
    setBusca('')
    setValoresTexto(new Map())
    setErro(null)
    setModalAberto(true)
  }, [funcionarios])

  // Fechar modal
  const fechar = useCallback(() => {
    setModalAberto(false)
    setItens([])
    setErro(null)
  }, [])

  // Funcionários filtrados
  const funcionariosFiltrados = useMemo(() => {
    let resultado = funcionarios

    if (filtroEmpresa) {
      resultado = resultado.filter(f => f.empresa_id === filtroEmpresa)
    }

    if (busca.trim()) {
      const termo = busca.toLowerCase().trim()
      resultado = resultado.filter(f =>
        f.nome_completo.toLowerCase().includes(termo) ||
        f.matricula?.toLowerCase().includes(termo)
      )
    }

    return resultado
  }, [funcionarios, filtroEmpresa, busca])

  // Toggle seleção
  const toggleSelecionar = useCallback((funcionarioId: number) => {
    setItens(prev => prev.map(item =>
      item.funcionario.id === funcionarioId
        ? { ...item, selecionado: !item.selecionado }
        : item
    ))
  }, [])

  // Selecionar todos filtrados
  const selecionarTodos = useCallback(() => {
    const idsFiltrados = new Set(funcionariosFiltrados.map(f => f.id))
    setItens(prev => prev.map(item =>
      idsFiltrados.has(item.funcionario.id)
        ? { ...item, selecionado: true }
        : item
    ))
  }, [funcionariosFiltrados])

  // Deselecionar todos
  const deselecionarTodos = useCallback(() => {
    setItens(prev => prev.map(item => ({ ...item, selecionado: false, valor: 0, quantidadeHoras: '' })))
    setValoresTexto(new Map())
  }, [])

  // Atualizar valor
  const atualizarValor = useCallback((funcionarioId: number, valor: number, valorTexto: string) => {
    setItens(prev => prev.map(item =>
      item.funcionario.id === funcionarioId
        ? { ...item, valor, selecionado: valor > 0 ? true : item.selecionado }
        : item
    ))
    setValoresTexto(prev => new Map(prev).set(funcionarioId, valorTexto))
  }, [])

  // Atualizar quantidade de horas individual
  const atualizarHoras = useCallback((funcionarioId: number, horas: string) => {
    setItens(prev => prev.map(item =>
      item.funcionario.id === funcionarioId
        ? { ...item, quantidadeHoras: horas }
        : item
    ))
  }, [])

  // Aplicar valor para todos selecionados
  const aplicarValorParaTodos = useCallback((valor: number, valorTexto: string) => {
    setItens(prev => prev.map(item =>
      item.selecionado ? { ...item, valor } : item
    ))
    setValoresTexto(prev => {
      const novos = new Map(prev)
      itens.forEach(item => {
        if (item.selecionado) {
          novos.set(item.funcionario.id!, valorTexto)
        }
      })
      return novos
    })
  }, [itens])

  // Aplicar horas globais para todos selecionados
  const aplicarHorasParaTodos = useCallback((horas: string) => {
    setItens(prev => prev.map(item =>
      item.selecionado ? { ...item, quantidadeHoras: horas } : item
    ))
  }, [])

  // Itens selecionados com valor
  const itensSelecionadosComValor = useMemo(() => {
    return itens.filter(item => item.selecionado && item.valor > 0)
  }, [itens])

  // Total
  const total = useMemo(() => {
    return itensSelecionadosComValor.reduce((acc, item) => acc + item.valor, 0)
  }, [itensSelecionadosComValor])

  // Obter item por funcionário
  const getItem = useCallback((funcionarioId: number) => {
    return itens.find(i => i.funcionario.id === funcionarioId)
  }, [itens])

  // Obter valor texto
  const getValorTexto = useCallback((funcionarioId: number) => {
    return valoresTexto.get(funcionarioId) || ''
  }, [valoresTexto])

  // Handler para mudança de tipo (limpa horas se não for horas_extras)
  const handleTipoChange = useCallback((novoTipo: TipoPagamentoExtra) => {
    setTipo(novoTipo)
    if (novoTipo !== 'horas_extras') {
      setQuantidadeHorasGlobal('')
      // Limpa horas de todos os itens
      setItens(prev => prev.map(item => ({ ...item, quantidadeHoras: '' })))
    }
  }, [])

  // Salvar lote
  const salvar = useCallback(async (): Promise<boolean> => {
    if (itensSelecionadosComValor.length === 0) {
      setErro('Selecione pelo menos um funcionário e informe o valor')
      return false
    }

    setSalvando(true)
    setErro(null)

    try {
      const promises = itensSelecionadosComValor.map(item =>
        criarPagamentoExtra({
          funcionario_id: item.funcionario.id!,
          tipo,
          descricao: descricao || null,
          valor: item.valor,
          competencia_mes: competenciaMes,
          competencia_ano: competenciaAno,
          data_pagamento: dataPagamento || null,
          quantidade_horas: tipo === 'horas_extras' && item.quantidadeHoras ? item.quantidadeHoras : null,
        })
      )

      await Promise.all(promises)
      onSucesso()
      fechar()
      return true
    } catch (error) {
      console.error('Erro ao salvar lote:', error)
      setErro('Erro ao salvar pagamentos em lote')
      return false
    } finally {
      setSalvando(false)
    }
  }, [itensSelecionadosComValor, tipo, descricao, dataPagamento, competenciaMes, competenciaAno, onSucesso, fechar])

  return {
    // Modal
    modalAberto,
    salvando,
    erro,
    setErro,
    abrir,
    fechar,

    // Configurações
    tipo,
    descricao,
    dataPagamento,
    quantidadeHoras: quantidadeHorasGlobal,
    setTipo: handleTipoChange,
    setDescricao,
    setDataPagamento,
    setQuantidadeHoras: setQuantidadeHorasGlobal,
    aplicarHorasParaTodos,

    // Filtros
    filtroEmpresa,
    busca,
    setFiltroEmpresa,
    setBusca,
    funcionariosFiltrados,
    empresas,

    // Itens
    itens,
    getItem,
    getValorTexto,
    toggleSelecionar,
    selecionarTodos,
    deselecionarTodos,
    atualizarValor,
    atualizarHoras,
    aplicarValorParaTodos,

    // Resumo
    itensSelecionadosComValor,
    total,

    // Ações
    salvar,
  }
}