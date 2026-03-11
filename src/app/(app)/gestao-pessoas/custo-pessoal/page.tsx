'use client'

import { DollarSign, Download } from 'lucide-react'
import { useCustoPessoal } from '@/hooks/useCustoPessoal'
import { PageHeader, LoadingState } from '@/components/gestao-pessoas'
import {
  FiltrosPeriodo,
  CardsResumo,
  SeletorVisualizacao,
  VisaoConsolidada,
  VisaoMensal,
  VisaoPorEmpresa,
  VisaoPorSetor, 
  VisaoPorFuncionario,
} from '@/components/gestao-pessoas/custo-pessoal'
import * as XLSX from 'xlsx'

export default function CustoPessoalPage() {
  const {
    dados,
    carregando,
    erro,
    setErro,
    empresas,
    setores,
    cargos,
    funcionarios,
    filtros,
    atualizarFiltro,
    limparFiltros,
    temFiltrosAtivos,
    periodoAnterior,
    periodoProximo,
    visualizacao,
    setVisualizacao,
    funcionarioExpandido,
    toggleFuncionarioExpandido,
    percentuais,
  } = useCustoPessoal()

  // Exportar para Excel
  function handleExportar() {
    if (!dados) return

    const wb = XLSX.utils.book_new()

    // Aba Resumo
    const resumoData = [
      ['CUSTO DE PESSOAL - RESUMO', ''],
      ['Período', dados.periodoLabel],
      ['', ''],
      ['Componente', 'Valor', 'Percentual'],
      ['Salários', dados.resumoGeral.salarios, `${percentuais.salarios.toFixed(1)}%`],
      ['Outros Proventos', dados.resumoGeral.outrosProventos, `${percentuais.outrosProventos.toFixed(1)}%`],
      ['FGTS', dados.resumoGeral.fgts, ''],
      ['INSS Patronal', dados.resumoGeral.inssPatronal, ''],
      ['Total Encargos', dados.resumoGeral.totalEncargos, `${percentuais.encargos.toFixed(1)}%`],
      ['Provisão 13º', dados.resumoGeral.provisao13, ''],
      ['Provisão Férias', dados.resumoGeral.provisaoFerias, ''],
      ['Provisão 1/3 Férias', dados.resumoGeral.provisao13Ferias, ''],
      ['Provisão Rescisão', dados.resumoGeral.provisaoRescisao, ''],
      ['Total Provisões', dados.resumoGeral.totalProvisoes, `${percentuais.provisoes.toFixed(1)}%`],
      ['Pagamentos Extras', dados.resumoGeral.pagamentosExtras, `${percentuais.extras.toFixed(1)}%`],
      ['', '', ''],
      ['CUSTO TOTAL', dados.resumoGeral.custoTotal, '100%'],
    ]
    const wsResumo = XLSX.utils.aoa_to_sheet(resumoData)
    XLSX.utils.book_append_sheet(wb, wsResumo, 'Resumo')

    // Aba Mensal
    const mensalHeader = ['Mês', 'Salários', 'Outros', 'FGTS', 'INSS', 'Prov 13º', 'Prov Férias', 'Prov 1/3', 'Prov Rescisão', 'Extras', 'Total', 'Variação']
    const mensalData = dados.custosMensais.map(m => [
      m.competenciaLabel,
      m.salarios,
      m.outrosProventos,
      m.fgts,
      m.inssPatronal,
      m.provisao13,
      m.provisaoFerias,
      m.provisao13Ferias,
      m.provisaoRescisao,
      m.pagamentosExtras,
      m.custoTotal,
      m.variacaoPercentual !== null ? `${m.variacaoPercentual.toFixed(1)}%` : '-',
    ])
    const wsMensal = XLSX.utils.aoa_to_sheet([mensalHeader, ...mensalData])
    XLSX.utils.book_append_sheet(wb, wsMensal, 'Por Mês')

    // Aba Por Empresa
    const empresaHeader = ['Empresa', 'Funcionários', 'Salários', 'Outros', 'Encargos', 'Provisões', 'Extras', 'Total', '%']
    const empresaData = dados.custosPorEmpresa.map(e => [
      e.empresaNome,
      e.quantidadeFuncionarios,
      e.salarios,
      e.outrosProventos,
      e.totalEncargos,
      e.totalProvisoes,
      e.pagamentosExtras,
      e.custoTotal,
      `${e.percentualTotal.toFixed(1)}%`,
    ])
    const wsEmpresa = XLSX.utils.aoa_to_sheet([empresaHeader, ...empresaData])
    XLSX.utils.book_append_sheet(wb, wsEmpresa, 'Por Empresa')

    // Aba Por Funcionário
    const funcHeader = ['Funcionário', 'Empresa', 'Cargo', 'Setor', 'Salário Base', 'Total Período']
    const funcData = dados.custosPorFuncionario.map(f => [
      f.funcionarioNome,
      f.empresaNome,
      f.cargoNome || '-',
      f.setorNome || '-',
      f.salarioBase,
      f.custoTotal,
    ])
    const wsFunc = XLSX.utils.aoa_to_sheet([funcHeader, ...funcData])
    XLSX.utils.book_append_sheet(wb, wsFunc, 'Por Funcionário')

    XLSX.writeFile(wb, `custo_pessoal_${filtros.mesInicio}_${filtros.anoInicio}_a_${filtros.mesFim}_${filtros.anoFim}.xlsx`)
  }

  if (carregando) {
    return <LoadingState mensagem="Calculando custos de pessoal..." cor="purple" />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <PageHeader
        titulo="Custo de Pessoal"
        descricao="Visão consolidada de todos os custos com pessoal"
        icone={DollarSign}
        cor="purple"
        acaoPrincipal={{
          label: 'Exportar',
          onClick: handleExportar,
          icone: Download,
        }}
      />

      <div className="p-6">
        {/* Erro */}
        {erro && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {erro}
            <button onClick={() => setErro(null)} className="ml-2 underline">
              Fechar
            </button>
          </div>
        )}

        {/* Filtros */}
        <FiltrosPeriodo
          filtros={filtros}
          empresas={empresas}
          setores={setores}
          cargos={cargos}
          funcionarios={funcionarios}
          temFiltrosAtivos={temFiltrosAtivos}
          onFiltroChange={atualizarFiltro}
          onLimparFiltros={limparFiltros}
          onPeriodoAnterior={periodoAnterior}
          onPeriodoProximo={periodoProximo}
        />

        {/* Cards de Resumo */}
        <CardsResumo
          resumo={dados?.resumoGeral || null}
          percentuais={percentuais}
          periodoLabel={dados?.periodoLabel || ''}
        />

        {/* Seletor de Visualização */}
        <SeletorVisualizacao
          visualizacao={visualizacao}
          onChange={setVisualizacao}
        />

        {/* Visão Atual */}
        {dados && (
          <>
            {visualizacao === 'consolidado' && (
              <VisaoConsolidada custosMensais={dados.custosMensais} />
            )}

            {visualizacao === 'mensal' && (
              <VisaoMensal custosMensais={dados.custosMensais} />
            )}

            {visualizacao === 'empresa' && (
              <VisaoPorEmpresa custosPorEmpresa={dados.custosPorEmpresa} />
            )}

            {visualizacao === 'setor' && (
              <VisaoPorSetor custosPorSetor={dados.custosPorSetor} />
            )}

            {visualizacao === 'funcionario' && (
              <VisaoPorFuncionario
                custosPorFuncionario={dados.custosPorFuncionario}
                funcionarioExpandido={funcionarioExpandido}
                onToggleExpandir={toggleFuncionarioExpandido}
              />
            )}
          </>
        )}

        {/* Sem dados */}
        {!dados && !carregando && (
          <div className="text-center py-12 text-slate-500">
            Nenhum dado encontrado para o período selecionado
          </div>
        )}
      </div>
    </div>
  )
}