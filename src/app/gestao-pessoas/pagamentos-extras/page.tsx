'use client'

import { useState, useMemo } from 'react'
import { gerarReciboIndividual, gerarRecibosLote } from '@/services/reciboService'
import { Wallet, Plus } from 'lucide-react'
import { usePagamentosExtras } from '@/hooks/usePagamentosExtras'
import { usePagamentoLote } from '@/hooks/usePagamentoLote'
import { PagamentoExtra } from '@/types/pessoas'
import { PageHeader, LoadingState, ConfirmDialog } from '@/components/gestao-pessoas'
import { 
  CompetenciaCard, 
  TipoFilterCards,
  PagamentosTable, 
  BarraSelecao,
  ModalPagamento,
  ModalLote 
} from '@/components/gestao-pessoas/pagamentos-extras'
import { formatarData, parseMoeda } from '@/utils/formatters'
import { getLabelTipoPagamento } from '@/types/pessoas'
import * as XLSX from 'xlsx'

const MESES = [
  { value: 1, label: 'Janeiro' }, { value: 2, label: 'Fevereiro' },
  { value: 3, label: 'Março' }, { value: 4, label: 'Abril' },
  { value: 5, label: 'Maio' }, { value: 6, label: 'Junho' },
  { value: 7, label: 'Julho' }, { value: 8, label: 'Agosto' },
  { value: 9, label: 'Setembro' }, { value: 10, label: 'Outubro' },
  { value: 11, label: 'Novembro' }, { value: 12, label: 'Dezembro' },
]

export default function PagamentosExtrasPage() {
  // Hook principal
  const {
    pagamentos,
    funcionarios,
    empresas,
    resumoCompetencia,
    carregando,
    erro,
    filtroCompetenciaMes,
    filtroCompetenciaAno,
    filtroEmpresa,
    filtroTipo,
    filtroBusca,
    setFiltroCompetenciaMes,
    setFiltroCompetenciaAno,
    setFiltroEmpresa,
    setFiltroTipo,
    setFiltroBusca,
    temFiltrosAtivos,
    
    competenciaAnterior,
    competenciaProxima,
    modalAberto,
    pagamentoEditando,
    salvando,
    abrirModalCriar,
    abrirModalEditar,
    fecharModal,
    setPagamentoEditando,
    salvar,
    excluir,
    setErro,
    carregar,
  } = usePagamentosExtras()

  // Hook de lote
  const lote = usePagamentoLote({
    funcionarios,
    empresas,
    competenciaMes: filtroCompetenciaMes,
    competenciaAno: filtroCompetenciaAno,
    onSucesso: carregar,
  })

  // Estados locais
  const [confirmExcluir, setConfirmExcluir] = useState<number | null>(null)
  const [valorTexto, setValorTexto] = useState('')
  const [selecionados, setSelecionados] = useState<Set<number>>(new Set())

  // Labels
  const competenciaLabel = `${MESES.find(m => m.value === filtroCompetenciaMes)?.label}/${filtroCompetenciaAno}`

  // Pagamentos filtrados por busca (já vem filtrado do hook, mas busca é local)
  const pagamentosFiltrados = useMemo(() => {
    if (!filtroBusca.trim()) return pagamentos
    const termo = filtroBusca.toLowerCase().trim()
    return pagamentos.filter(p =>
      p.funcionario?.nome_completo.toLowerCase().includes(termo) ||
      p.descricao?.toLowerCase().includes(termo)
    )
  }, [pagamentos, filtroBusca])

  // Handlers de Seleção
  function handleToggleSelecao(id: number) {
    setSelecionados(prev => {
      const novos = new Set(prev)
      if (novos.has(id)) {
        novos.delete(id)
      } else {
        novos.add(id)
      }
      return novos
    })
  }

  function handleSelecionarTodos() {
    const ids = pagamentosFiltrados.map(p => p.id!).filter(Boolean)
    setSelecionados(new Set(ids))
  }

  function handleDeselecionarTodos() {
    setSelecionados(new Set())
  }

  // Handlers de CRUD
  function handleNovoPagamento() {
    setValorTexto('')
    abrirModalCriar()
  }

  function handleEditarPagamento(pagamento: PagamentoExtra) {
    setValorTexto(Number(pagamento.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 }))
    abrirModalEditar(pagamento)
  }

  async function handleSalvarPagamento() {
    if (!pagamentoEditando) return

    if (!pagamentoEditando.funcionario_id) {
      setErro('Selecione um funcionário')
      return
    }

    const valor = parseMoeda(valorTexto)
    if (valor <= 0) {
      setErro('Informe um valor válido')
      return
    }

    await salvar({ ...pagamentoEditando, valor })
  }

  function handlePagamentoChange(campo: keyof PagamentoExtra, valor: string | number | null) {
    if (pagamentoEditando) {
      setPagamentoEditando({ ...pagamentoEditando, [campo]: valor })
    }
  }

  async function handleConfirmarExclusao() {
    if (confirmExcluir) {
      const sucesso = await excluir(confirmExcluir)
      if (sucesso) setConfirmExcluir(null)
    }
  }

  // Handlers de Impressão
function handleImprimirRecibo(pagamento: PagamentoExtra) {
  gerarReciboIndividual(pagamento)
}

function handleGerarRecibosLote() {
  const pagamentosSelecionados = pagamentosFiltrados.filter(p => selecionados.has(p.id!))
  if (pagamentosSelecionados.length === 0) {
    setErro('Selecione pelo menos um pagamento')
    return
  }
  gerarRecibosLote(pagamentosSelecionados)
}

  // Exportar Excel
  function handleExportar() {
    const dados = pagamentosFiltrados.map(p => ({
      'Competência': competenciaLabel,
      'Funcionário': p.funcionario?.nome_completo || '-',
      'Empresa': p.funcionario?.empresa?.razao_social || '-',
      'Tipo': getLabelTipoPagamento(p.tipo),
      'Descrição': p.descricao || '-',
      'Valor': Number(p.valor),
      'Data Pagamento': p.data_pagamento ? formatarData(p.data_pagamento) : '-',
    }))

    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(dados)
    XLSX.utils.book_append_sheet(wb, ws, 'Pagamentos Extras')
    XLSX.writeFile(wb, `pagamentos_extras_${filtroCompetenciaMes}_${filtroCompetenciaAno}.xlsx`)
  }

  if (carregando) {
    return <LoadingState mensagem="Carregando pagamentos extras..." cor="amber" />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <PageHeader
        titulo="Pagamentos Extras"
        descricao="Registre pagamentos adicionais sem incidência de encargos"
        icone={Wallet}
        cor="amber"
        acaoPrincipal={{
          label: 'Novo Pagamento',
          onClick: handleNovoPagamento,
          icone: Plus,
        }}
      />

      <div className="p-6">
        {/* Erro */}
        {(erro || lote.erro) && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {erro || lote.erro}
            <button 
              onClick={() => { setErro(null); lote.setErro(null) }} 
              className="ml-2 underline"
            >
              Fechar
            </button>
          </div>
        )}

        {/* Card de Competência */}
        <CompetenciaCard
          mes={filtroCompetenciaMes}
          ano={filtroCompetenciaAno}
          totalGeral={resumoCompetencia?.total || 0}
          quantidadeGeral={resumoCompetencia?.quantidade || 0}
          empresas={empresas}
          empresaSelecionada={filtroEmpresa}
          onMesChange={setFiltroCompetenciaMes}
          onAnoChange={setFiltroCompetenciaAno}
          onAnterior={competenciaAnterior}
          onProxima={competenciaProxima}
          onEmpresaChange={setFiltroEmpresa}
          onLote={lote.abrir}
          onExportar={handleExportar}
        />

        {/* Cards de Filtro por Tipo */}
        <TipoFilterCards
          resumoPorTipo={resumoCompetencia?.porTipo || []}
          tipoSelecionado={filtroTipo}
          onTipoChange={setFiltroTipo}
        />

        {/* Busca simples */}
        <div className="mb-6">
          <input
            type="text"
            value={filtroBusca}
            onChange={(e) => setFiltroBusca(e.target.value)}
            placeholder="Buscar por funcionário ou descrição..."
            className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
          />
        </div>

        {/* Tabela */}
        <PagamentosTable
          pagamentos={pagamentosFiltrados}
          temFiltrosAtivos={temFiltrosAtivos}
          competenciaLabel={competenciaLabel}
          selecionados={selecionados}
          onToggleSelecao={handleToggleSelecao}
          onSelecionarTodos={handleSelecionarTodos}
          onDeselecionarTodos={handleDeselecionarTodos}
          onEditar={handleEditarPagamento}
          onExcluir={setConfirmExcluir}
          onImprimir={handleImprimirRecibo}
          onNovo={handleNovoPagamento}
        />
      </div>

      {/* Barra de Seleção Flutuante */}
      <BarraSelecao
        quantidade={selecionados.size}
        onGerarRecibos={handleGerarRecibosLote}
        onLimpar={handleDeselecionarTodos}
      />

      {/* Modal Individual */}
      <ModalPagamento
        aberto={modalAberto}
        pagamento={pagamentoEditando}
        valorTexto={valorTexto}
        funcionarios={funcionarios}
        salvando={salvando}
        onFechar={fecharModal}
        onSalvar={handleSalvarPagamento}
        onValorChange={setValorTexto}
        onPagamentoChange={handlePagamentoChange}
      />

      {/* Modal Lote */}
      <ModalLote
        aberto={lote.modalAberto}
        competenciaMes={filtroCompetenciaMes}
        competenciaAno={filtroCompetenciaAno}
        tipo={lote.tipo}
        descricao={lote.descricao}
        dataPagamento={lote.dataPagamento}
        onTipoChange={lote.setTipo}
        onDescricaoChange={lote.setDescricao}
        onDataPagamentoChange={lote.setDataPagamento}
        filtroEmpresa={lote.filtroEmpresa}
        busca={lote.busca}
        empresas={empresas}
        onFiltroEmpresaChange={lote.setFiltroEmpresa}
        onBuscaChange={lote.setBusca}
        funcionariosFiltrados={lote.funcionariosFiltrados}
        getItem={lote.getItem}
        getValorTexto={lote.getValorTexto}
        onToggleSelecionar={lote.toggleSelecionar}
        onSelecionarTodos={lote.selecionarTodos}
        onDeselecionarTodos={lote.deselecionarTodos}
        onAtualizarValor={lote.atualizarValor}
        onAplicarValorTodos={lote.aplicarValorParaTodos}
        quantidadeSelecionados={lote.itensSelecionadosComValor.length}
        total={lote.total}
        salvando={lote.salvando}
        onFechar={lote.fechar}
        onSalvar={lote.salvar}
      />

      {/* Confirmação de Exclusão */}
      <ConfirmDialog
        aberto={!!confirmExcluir}
        titulo="Excluir Pagamento"
        mensagem="Tem certeza que deseja excluir este pagamento? Esta ação não pode ser desfeita."
        onConfirmar={handleConfirmarExclusao}
        onCancelar={() => setConfirmExcluir(null)}
        labelConfirmar="Excluir"
        tipo="perigo"
      />
    </div>
  )
}