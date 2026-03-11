'use client'
import React from 'react' 
import { useState } from 'react'
import { Calculator, Download, Building2, Users, ChevronDown, ChevronRight, Search, Filter, X, FolderTree, Briefcase } from 'lucide-react'
import { useEncargos } from '@/hooks/useEncargos'
import { PageHeader, LoadingState } from '@/components/gestao-pessoas'
import { formatarMoeda, formatarPercentual } from '@/utils/formatters'
import { ALIQUOTA_FGTS } from '@/services/encargosService'
import * as XLSX from 'xlsx'

type VisualizacaoTipo = 'detalhada' | 'consolidada'

export default function EncargosPage() {
  const {
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
    setErro,
  } = useEncargos()

  const [visualizacao, setVisualizacao] = useState<VisualizacaoTipo>('detalhada')
  const [expandidos, setExpandidos] = useState<Set<number>>(new Set())
  const [mostrarFiltros, setMostrarFiltros] = useState(false)

  const toggleExpandir = (id: number) => {
    setExpandidos(prev => {
      const novos = new Set(prev)
      if (novos.has(id)) {
        novos.delete(id)
      } else {
        novos.add(id)
      }
      return novos
    })
  }

  const expandirTodos = () => {
    setExpandidos(new Set(funcionarios.map(f => f.id!)))
  }

  const recolherTodos = () => {
    setExpandidos(new Set())
  }

  // Exportar Excel
  const exportarExcel = () => {
    const dadosDetalhados = funcionarios.map(f => ({
      'Funcionário': f.nome_completo,
      'Empresa': f.empresa?.razao_social || '-',
      'Setor': f.setor?.nome || '-',
      'Cargo': f.cargo?.nome || '-',
      'Salário': Number(f.salario),
      'Outros Proventos': Number(f.outros_proventos || 0),
      'FGTS (8%)': f.encargos.fgts,
      'INSS Patronal': f.encargos.inssPatronal,
      'Total Encargos': f.encargos.totalEncargos,
      '13º Salário': f.encargos.decimoTerceiro,
      'Férias + 1/3': f.encargos.feriasComTerco,
      'Prov. Rescisão': f.encargos.provisaoRescisao,
      'Encargos s/ Provisões': f.encargos.totalEncargosProvisoes,
      'Total Provisões': f.encargos.totalProvisoes,
      'Custo Mensal Total': f.encargos.custoMensalTotal,
    }))

    const dadosConsolidados = resumoEmpresas.map(r => ({
      'Empresa': r.empresa.razao_social,
      'Funcionários': r.totalFuncionarios,
      'Total Salários': r.totalSalarios,
      'Outros Proventos': r.totalOutrosProventos,
      'FGTS': r.totalFgts,
      'INSS': r.totalInss,
      'Total Encargos': r.totalEncargos,
      '13º Salário': r.totalDecimoTerceiro,
      'Férias + 1/3': r.totalFerias,
      'Prov. Rescisão': r.totalProvisaoRescisao,
      'Encargos s/ Provisões': r.totalEncargosProvisoes,
      'Total Provisões': r.totalProvisoes,
      'Custo Mensal Total': r.custoMensalTotal,
    }))

    const wb = XLSX.utils.book_new()
    
    const ws1 = XLSX.utils.json_to_sheet(dadosDetalhados)
    XLSX.utils.book_append_sheet(wb, ws1, 'Detalhado')
    
    const ws2 = XLSX.utils.json_to_sheet(dadosConsolidados)
    XLSX.utils.book_append_sheet(wb, ws2, 'Consolidado')
    
    XLSX.writeFile(wb, 'encargos_provisoes_tophaus.xlsx')
  }

  if (carregando) {
    return <LoadingState mensagem="Calculando encargos e provisões..." cor="purple" />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <PageHeader
        titulo="Encargos e Provisões"
        descricao="Cálculos trabalhistas mensais"
        icone={Calculator}
        cor="purple"
        acaoPrincipal={{
          label: 'Exportar Excel',
          onClick: exportarExcel,
          icone: Download,
        }}
      />

      <div className="p-6">
        {/* Mensagem de erro */}
        {erro && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {erro}
            <button onClick={() => setErro(null)} className="ml-2 underline">Fechar</button>
          </div>
        )}

        {/* Card de Funcionários com divisão por empresa */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-5 text-white mb-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Total de Funcionários</p>
              <p className="text-4xl font-bold mt-1">{funcionariosTodos.length}</p>
            </div>
            <Users className="w-10 h-10 text-purple-200" />
          </div>
          
          {/* Divisão por empresa */}
          <div className="mt-4 pt-4 border-t border-purple-400/30">
            <p className="text-purple-200 text-xs font-medium mb-2">Por Empresa</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {resumoEmpresasTodos.map(r => (
                <div 
                  key={r.empresa.id} 
                  className="bg-white/10 rounded-lg px-3 py-2 flex justify-between items-center"
                >
                  <span className="text-sm truncate mr-2">{r.empresa.razao_social}</span>
                  <span className="font-bold text-lg">{r.totalFuncionarios}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Barra de Busca e Filtros */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Busca */}
            <div className="flex-1 relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={filtroBusca}
                onChange={(e) => setFiltroBusca(e.target.value)}
                placeholder="Buscar por nome ou matrícula..."
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
              />
            </div>

            {/* Botão Filtros */}
            <button
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
              className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl transition-colors ${
                temFiltrosAtivos 
                  ? 'border-purple-500 bg-purple-50 text-purple-700' 
                  : 'border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filtros
              {temFiltrosAtivos && (
                <span className="bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {[filtroEmpresa, filtroSetor, filtroCargo].filter(Boolean).length}
                </span>
              )}
            </button>

            {/* Limpar Filtros */}
            {temFiltrosAtivos && (
              <button
                onClick={limparFiltros}
                className="flex items-center gap-2 px-4 py-2.5 text-slate-500 hover:text-slate-700 transition-colors"
              >
                <X className="w-4 h-4" />
                Limpar
              </button>
            )}

            {/* Tipo de visualização */}
            <div className="flex items-center gap-2 bg-slate-100 rounded-xl p-1">
              <button
                onClick={() => setVisualizacao('detalhada')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  visualizacao === 'detalhada'
                    ? 'bg-white text-purple-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                Detalhada
              </button>
              <button
                onClick={() => setVisualizacao('consolidada')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  visualizacao === 'consolidada'
                    ? 'bg-white text-purple-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                Consolidada
              </button>
            </div>
          </div>

          {/* Filtros Expandidos */}
          {mostrarFiltros && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-200">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1">
                  <Building2 className="w-4 h-4" />
                  Empresa
                </label>
                <select
                  value={filtroEmpresa || ''}
                  onChange={(e) => setFiltroEmpresa(e.target.value ? Number(e.target.value) : null)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none bg-white"
                >
                  <option value="">Todas</option>
                  {empresas.map((e) => (
                    <option key={e.id} value={e.id}>{e.razao_social}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1">
                  <FolderTree className="w-4 h-4" />
                  Setor
                </label>
                <select
                  value={filtroSetor || ''}
                  onChange={(e) => setFiltroSetor(e.target.value || null)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none bg-white"
                >
                  <option value="">Todos</option>
                  {setores.map((s) => (
                    <option key={s.id} value={s.id}>{s.nome}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1">
                  <Briefcase className="w-4 h-4" />
                  Cargo
                </label>
                <select
                  value={filtroCargo || ''}
                  onChange={(e) => setFiltroCargo(e.target.value ? Number(e.target.value) : null)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none bg-white"
                >
                  <option value="">Todos</option>
                  {cargos.map((c) => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Alíquotas da empresa selecionada */}
          {empresaSelecionada && (
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-200">
              <span className="text-sm text-slate-600">Alíquotas de {empresaSelecionada.razao_social}:</span>
              <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">
                INSS: {formatarPercentual(Number(empresaSelecionada.aliquota_inss))}
              </span>
              <span className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg text-sm font-medium">
                Rescisão: {formatarPercentual(Number(empresaSelecionada.aliquota_provisao_rescisao))}
              </span>
            </div>
          )}
        </div>

        {/* Cards de Resumo dos Filtrados */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-4 border border-slate-200">
            <p className="text-slate-500 text-xs font-medium">Total Salários</p>
            <p className="text-lg font-bold text-slate-800 mt-1">{formatarMoeda(resumoGeral.totalSalarios)}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-slate-200">
            <p className="text-slate-500 text-xs font-medium">Encargos Mensais</p>
            <p className="text-lg font-bold text-blue-600 mt-1">{formatarMoeda(resumoGeral.totalEncargos)}</p>
            <p className="text-xs text-slate-400 mt-1">FGTS + INSS</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-slate-200">
            <p className="text-slate-500 text-xs font-medium">Provisões</p>
            <p className="text-lg font-bold text-amber-600 mt-1">{formatarMoeda(resumoGeral.totalProvisoes)}</p>
            <p className="text-xs text-slate-400 mt-1">13º + Férias + Rescisão</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-slate-200">
            <p className="text-slate-500 text-xs font-medium">Outros Proventos</p>
            <p className="text-lg font-bold text-slate-600 mt-1">{formatarMoeda(resumoGeral.totalOutrosProventos)}</p>
            <p className="text-xs text-slate-400 mt-1">Sem encargos</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-4 text-white">
            <p className="text-emerald-100 text-xs font-medium">Custo Total Mensal</p>
            <p className="text-lg font-bold mt-1">{formatarMoeda(resumoGeral.custoMensalTotal)}</p>
            <p className="text-xs text-emerald-200 mt-1">{funcionarios.length} funcionário(s)</p>
          </div>
        </div>

        {/* Legenda de Alíquotas */}
        <div className="bg-slate-800 text-white rounded-2xl p-4 mb-6">
          <div className="flex flex-wrap gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
              <span>FGTS: {formatarPercentual(ALIQUOTA_FGTS * 100)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
              <span>INSS Patronal: conforme cadastro da empresa</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-amber-500 rounded-full"></span>
              <span>13º + Férias + 1/3: incide FGTS e INSS</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-red-500 rounded-full"></span>
              <span>Provisão Rescisão: não incide encargos</span>
            </div>
          </div>
        </div>

        {/* Visão Detalhada */}
        {visualizacao === 'detalhada' && (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Detalhamento por Funcionário</h3>
                <p className="text-sm text-slate-500">
                  {funcionarios.length} funcionário(s) {temFiltrosAtivos ? '(filtrado)' : ''}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={expandirTodos}
                  className="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Expandir Todos
                </button>
                <button
                  onClick={recolherTodos}
                  className="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Recolher Todos
                </button>
              </div>
            </div>
            
            {funcionarios.length === 0 ? (
              <div className="p-8 text-center">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">Nenhum funcionário encontrado com os filtros aplicados.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-800 text-white">
                    <tr>
                      <th className="text-left p-4 min-w-[250px]">Funcionário</th>
                      <th className="text-right p-4">Salário</th>
                      <th className="text-right p-4">FGTS</th>
                      <th className="text-right p-4">INSS</th>
                      <th className="text-right p-4 bg-blue-700">Encargos</th>
                      <th className="text-right p-4">13º</th>
                      <th className="text-right p-4">Férias+1/3</th>
                      <th className="text-right p-4">Rescisão</th>
                      <th className="text-right p-4 bg-amber-600">Provisões</th>
                      <th className="text-right p-4 bg-emerald-600">Custo Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {funcionarios.map((func) => {
                      const isExpanded = expandidos.has(func.id!)
                      
                      return (
                       <React.Fragment key={func.id}>
                          <tr 
                            onClick={() => toggleExpandir(func.id!)}
                            className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer"
                          >
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                {isExpanded ? (
                                  <ChevronDown className="w-4 h-4 text-slate-400" />
                                ) : (
                                  <ChevronRight className="w-4 h-4 text-slate-400" />
                                )}
                                <div>
                                  <p className="font-medium text-slate-800">{func.nome_completo}</p>
                                  <p className="text-xs text-slate-500">
                                    {func.empresa?.razao_social}
                                    {func.cargo && ` • ${func.cargo.nome}`}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 text-right tabular-nums">{formatarMoeda(Number(func.salario))}</td>
                            <td className="p-4 text-right tabular-nums text-blue-600">{formatarMoeda(func.encargos.fgts)}</td>
                            <td className="p-4 text-right tabular-nums text-purple-600">{formatarMoeda(func.encargos.inssPatronal)}</td>
                            <td className="p-4 text-right tabular-nums font-semibold bg-blue-50 text-blue-700">{formatarMoeda(func.encargos.totalEncargos)}</td>
                            <td className="p-4 text-right tabular-nums">{formatarMoeda(func.encargos.decimoTerceiro)}</td>
                            <td className="p-4 text-right tabular-nums">{formatarMoeda(func.encargos.feriasComTerco)}</td>
                            <td className="p-4 text-right tabular-nums text-red-600">{formatarMoeda(func.encargos.provisaoRescisao)}</td>
                            <td className="p-4 text-right tabular-nums font-semibold bg-amber-50 text-amber-700">{formatarMoeda(func.encargos.totalProvisoes)}</td>
                            <td className="p-4 text-right tabular-nums font-bold bg-emerald-50 text-emerald-700">{formatarMoeda(func.encargos.custoMensalTotal)}</td>
                          </tr>
                          
                          {/* Linha expandida com detalhes */}
                          {isExpanded && (
                            <tr key={`${func.id}-details`} className="bg-slate-50">
                              <td colSpan={10} className="p-4">
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                                  <div className="bg-white rounded-xl p-3 border border-slate-200">
                                    <p className="text-slate-500 text-xs mb-1">Setor / Cargo</p>
                                    <p className="font-semibold text-slate-700">{func.setor?.nome || '-'}</p>
                                    <p className="text-xs text-slate-400">{func.cargo?.nome || '-'}</p>
                                  </div>
                                  <div className="bg-white rounded-xl p-3 border border-slate-200">
                                    <p className="text-slate-500 text-xs mb-1">Outros Proventos</p>
                                    <p className="font-semibold text-slate-700">{formatarMoeda(Number(func.outros_proventos || 0))}</p>
                                    <p className="text-xs text-slate-400">Sem incidência</p>
                                  </div>
                                  <div className="bg-white rounded-xl p-3 border border-slate-200">
                                    <p className="text-slate-500 text-xs mb-1">Férias (base)</p>
                                    <p className="font-semibold text-slate-700">{formatarMoeda(func.encargos.ferias)}</p>
                                    <p className="text-xs text-slate-400">1/3: {formatarMoeda(func.encargos.tercoFerias)}</p>
                                  </div>
                                  <div className="bg-white rounded-xl p-3 border border-slate-200">
                                    <p className="text-slate-500 text-xs mb-1">Encargos s/ 13º</p>
                                    <p className="font-semibold text-slate-700">
                                      FGTS: {formatarMoeda(func.encargos.fgtsDecimoTerceiro)}
                                    </p>
                                    <p className="text-xs text-slate-400">
                                      INSS: {formatarMoeda(func.encargos.inssDecimoTerceiro)}
                                    </p>
                                  </div>
                                  <div className="bg-white rounded-xl p-3 border border-slate-200">
                                    <p className="text-slate-500 text-xs mb-1">Encargos s/ Férias</p>
                                    <p className="font-semibold text-slate-700">
                                      FGTS: {formatarMoeda(func.encargos.fgtsFerias)}
                                    </p>
                                    <p className="text-xs text-slate-400">
                                      INSS: {formatarMoeda(func.encargos.inssFerias)}
                                    </p>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      )
                    })}
                    
                    {/* Linha de Total */}
                    <tr className="bg-slate-800 text-white font-bold">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Users className="w-5 h-5" />
                          TOTAL ({funcionarios.length} funcionários)
                        </div>
                      </td>
                      <td className="p-4 text-right tabular-nums">{formatarMoeda(resumoGeral.totalSalarios)}</td>
                      <td className="p-4 text-right tabular-nums">{formatarMoeda(resumoGeral.totalFgts)}</td>
                      <td className="p-4 text-right tabular-nums">{formatarMoeda(resumoGeral.totalInss)}</td>
                      <td className="p-4 text-right tabular-nums bg-blue-700">{formatarMoeda(resumoGeral.totalEncargos)}</td>
                      <td className="p-4 text-right tabular-nums">{formatarMoeda(resumoGeral.totalDecimoTerceiro)}</td>
                      <td className="p-4 text-right tabular-nums">{formatarMoeda(resumoGeral.totalFerias)}</td>
                      <td className="p-4 text-right tabular-nums">{formatarMoeda(resumoGeral.totalProvisaoRescisao)}</td>
                      <td className="p-4 text-right tabular-nums bg-amber-600">{formatarMoeda(resumoGeral.totalProvisoes)}</td>
                      <td className="p-4 text-right tabular-nums bg-emerald-600">{formatarMoeda(resumoGeral.custoMensalTotal)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Visão Consolidada */}
        {visualizacao === 'consolidada' && (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-800">Consolidado por Empresa</h3>
              <p className="text-sm text-slate-500">
                {resumoEmpresas.length} empresa(s) {temFiltrosAtivos ? '(filtrado)' : ''}
              </p>
            </div>
            
            {resumoEmpresas.length === 0 ? (
              <div className="p-8 text-center">
                <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">Nenhuma empresa encontrada com os filtros aplicados.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-800 text-white">
                    <tr>
                      <th className="text-left p-4 min-w-[250px]">Empresa</th>
                      <th className="text-center p-4">Func.</th>
                      <th className="text-right p-4">Salários</th>
                      <th className="text-right p-4">Outros</th>
                      <th className="text-right p-4">FGTS</th>
                      <th className="text-right p-4">INSS</th>
                      <th className="text-right p-4 bg-blue-700">Encargos</th>
                      <th className="text-right p-4">13º</th>
                      <th className="text-right p-4">Férias+1/3</th>
                      <th className="text-right p-4">Rescisão</th>
                      <th className="text-right p-4 bg-amber-600">Provisões</th>
                      <th className="text-right p-4 bg-emerald-600">Custo Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resumoEmpresas.map((resumo) => (
                      <tr key={resumo.empresa.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="p-4">
                          <div>
                            <p className="font-medium text-slate-800">{resumo.empresa.razao_social}</p>
                            <div className="flex gap-2 mt-1">
                              <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                                INSS: {formatarPercentual(Number(resumo.empresa.aliquota_inss))}
                              </span>
                              <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded">
                                Resc: {formatarPercentual(Number(resumo.empresa.aliquota_provisao_rescisao))}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-center font-semibold">{resumo.totalFuncionarios}</td>
                        <td className="p-4 text-right tabular-nums">{formatarMoeda(resumo.totalSalarios)}</td>
                        <td className="p-4 text-right tabular-nums text-slate-500">{formatarMoeda(resumo.totalOutrosProventos)}</td>
                        <td className="p-4 text-right tabular-nums text-blue-600">{formatarMoeda(resumo.totalFgts)}</td>
                        <td className="p-4 text-right tabular-nums text-purple-600">{formatarMoeda(resumo.totalInss)}</td>
                        <td className="p-4 text-right tabular-nums font-semibold bg-blue-50 text-blue-700">{formatarMoeda(resumo.totalEncargos)}</td>
                        <td className="p-4 text-right tabular-nums">{formatarMoeda(resumo.totalDecimoTerceiro)}</td>
                        <td className="p-4 text-right tabular-nums">{formatarMoeda(resumo.totalFerias)}</td>
                        <td className="p-4 text-right tabular-nums text-red-600">{formatarMoeda(resumo.totalProvisaoRescisao)}</td>
                        <td className="p-4 text-right tabular-nums font-semibold bg-amber-50 text-amber-700">{formatarMoeda(resumo.totalProvisoes)}</td>
                        <td className="p-4 text-right tabular-nums font-bold bg-emerald-50 text-emerald-700">{formatarMoeda(resumo.custoMensalTotal)}</td>
                      </tr>
                    ))}
                    
                    {/* Linha de Total */}
                    <tr className="bg-slate-800 text-white font-bold">
                      <td className="p-4">TOTAL GERAL</td>
                      <td className="p-4 text-center">{resumoGeral.totalFuncionarios}</td>
                      <td className="p-4 text-right tabular-nums">{formatarMoeda(resumoGeral.totalSalarios)}</td>
                      <td className="p-4 text-right tabular-nums">{formatarMoeda(resumoGeral.totalOutrosProventos)}</td>
                      <td className="p-4 text-right tabular-nums">{formatarMoeda(resumoGeral.totalFgts)}</td>
                      <td className="p-4 text-right tabular-nums">{formatarMoeda(resumoGeral.totalInss)}</td>
                      <td className="p-4 text-right tabular-nums bg-blue-700">{formatarMoeda(resumoGeral.totalEncargos)}</td>
                      <td className="p-4 text-right tabular-nums">{formatarMoeda(resumoGeral.totalDecimoTerceiro)}</td>
                      <td className="p-4 text-right tabular-nums">{formatarMoeda(resumoGeral.totalFerias)}</td>
                      <td className="p-4 text-right tabular-nums">{formatarMoeda(resumoGeral.totalProvisaoRescisao)}</td>
                      <td className="p-4 text-right tabular-nums bg-amber-600">{formatarMoeda(resumoGeral.totalProvisoes)}</td>
                      <td className="p-4 text-right tabular-nums bg-emerald-600">{formatarMoeda(resumoGeral.custoMensalTotal)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}