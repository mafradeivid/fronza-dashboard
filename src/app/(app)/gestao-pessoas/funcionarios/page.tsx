'use client'

import { useState } from 'react'
import { Users, Plus, Pencil, Trash2, Save, Search, X, Filter, Cake, Gift } from 'lucide-react'
import { useFuncionarios } from '@/hooks/useFuncionarios'
import { Funcionario } from '@/types/pessoas'
import { PageHeader, Modal, EmptyState, LoadingState, ConfirmDialog } from '@/components/gestao-pessoas'
import { 
  formatarMoeda, 
  formatarData, 
  handleMoedaInput, 
  parseMoeda, 
  calcularTempoEmpresa,
  calcularIdade,
  calcularProximoAniversario,
  calcularAniversarioEmpresa
} from '@/utils/formatters'

export default function FuncionariosPage() {
  const {
    funcionarios,
    empresas,
    setores,
    cargos,
    carregando,
    erro,
    modalAberto,
    funcionarioEditando,
    salvando,
    abrirModalCriar,
    abrirModalEditar,
    fecharModal,
    salvar,
    excluir,
    setFuncionarioEditando,
    setErro,
    // Filtros
    filtroEmpresa,
    filtroSetor,
    filtroCargo,
    filtroBusca,
    setFiltroEmpresa,
    setFiltroSetor,
    setFiltroCargo,
    setFiltroBusca,
    limparFiltros,
    // Estatísticas
    totalFuncionarios,
    totalSalarios,
  } = useFuncionarios()

  const [confirmExcluir, setConfirmExcluir] = useState<number | null>(null)
  const [salarioTexto, setSalarioTexto] = useState('')
  const [outrosProventosTexto, setOutrosProventosTexto] = useState('')
  const [mostrarFiltros, setMostrarFiltros] = useState(false)

  // Calcular total de outros proventos
  const totalOutrosProventos = funcionarios.reduce((acc, f) => acc + Number(f.outros_proventos || 0), 0)

  function abrirModalCriarComReset() {
    setSalarioTexto('')
    setOutrosProventosTexto('')
    abrirModalCriar()
  }

  function abrirModalEditarComReset(funcionario: Funcionario) {
    setSalarioTexto(Number(funcionario.salario).toLocaleString('pt-BR', { minimumFractionDigits: 2 }))
    setOutrosProventosTexto(Number(funcionario.outros_proventos || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 }))
    abrirModalEditar(funcionario)
  }

  async function handleSalvar() {
    if (!funcionarioEditando) return
    
    if (!funcionarioEditando.nome_completo.trim()) {
      setErro('Nome é obrigatório')
      return
    }
    if (!funcionarioEditando.empresa_id) {
      setErro('Empresa é obrigatória')
      return
    }
    if (!funcionarioEditando.admissao) {
      setErro('Data de admissão é obrigatória')
      return
    }

    const funcionarioParaSalvar = {
      ...funcionarioEditando,
      salario: parseMoeda(salarioTexto),
      outros_proventos: parseMoeda(outrosProventosTexto),
    }

    await salvar(funcionarioParaSalvar)
  }

  async function handleConfirmarExclusao() {
    if (confirmExcluir) {
      const sucesso = await excluir(confirmExcluir)
      if (sucesso) {
        setConfirmExcluir(null)
      }
    }
  }

  function handleChange(campo: keyof Funcionario, valor: string | number | null) {
    if (funcionarioEditando) {
      setFuncionarioEditando({ ...funcionarioEditando, [campo]: valor })
    }
  }

  const temFiltrosAtivos = filtroEmpresa || filtroSetor || filtroCargo || filtroBusca

  if (carregando) {
    return <LoadingState mensagem="Carregando funcionários..." cor="violet" />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <PageHeader
        titulo="Cadastro de Funcionários"
        descricao="Gerencie os colaboradores"
        icone={Users}
        cor="violet"
        acaoPrincipal={{
          label: 'Novo Funcionário',
          onClick: abrirModalCriarComReset,
          icone: Plus,
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

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-violet-500 to-violet-600 rounded-2xl p-5 text-white">
            <p className="text-violet-100 text-sm font-medium">Total de Funcionários</p>
            <p className="text-3xl font-bold mt-1">{totalFuncionarios}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-200">
            <p className="text-slate-500 text-sm font-medium">Folha Salarial</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{formatarMoeda(totalSalarios)}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-200">
            <p className="text-slate-500 text-sm font-medium">Outros Proventos</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{formatarMoeda(totalOutrosProventos)}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-200">
            <p className="text-slate-500 text-sm font-medium">Total Geral</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{formatarMoeda(totalSalarios + totalOutrosProventos)}</p>
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
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none"
              />
            </div>

            {/* Botão Filtros */}
            <button
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
              className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl transition-colors ${
                temFiltrosAtivos 
                  ? 'border-violet-500 bg-violet-50 text-violet-700' 
                  : 'border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filtros
              {temFiltrosAtivos && (
                <span className="bg-violet-500 text-white text-xs px-2 py-0.5 rounded-full">
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
          </div>

          {/* Filtros Expandidos */}
          {mostrarFiltros && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-200">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Empresa</label>
                <select
                  value={filtroEmpresa || ''}
                  onChange={(e) => setFiltroEmpresa(e.target.value ? Number(e.target.value) : null)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none bg-white"
                >
                  <option value="">Todas</option>
                  {empresas.map((e) => (
                    <option key={e.id} value={e.id}>{e.razao_social}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Setor</label>
                <select
                  value={filtroSetor || ''}
                  onChange={(e) => setFiltroSetor(e.target.value || null)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none bg-white"
                >
                  <option value="">Todos</option>
                  {setores.map((s) => (
                    <option key={s.id} value={s.id}>{s.nome}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Cargo</label>
                <select
                  value={filtroCargo || ''}
                  onChange={(e) => setFiltroCargo(e.target.value ? Number(e.target.value) : null)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none bg-white"
                >
                  <option value="">Todos</option>
                  {cargos.map((c) => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Tabela */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          {funcionarios.length === 0 ? (
            <EmptyState
              titulo={temFiltrosAtivos ? "Nenhum funcionário encontrado" : "Nenhum funcionário cadastrado"}
              descricao={temFiltrosAtivos ? "Tente ajustar os filtros." : "Comece cadastrando o primeiro funcionário."}
              icone={Users}
              acao={temFiltrosAtivos ? undefined : { label: 'Cadastrar Funcionário', onClick: abrirModalCriarComReset }}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-800 text-white">
                  <tr>
                    <th className="text-left p-4">Funcionário</th>
                    <th className="text-left p-4">Empresa</th>
                    <th className="text-left p-4">Cargo / Setor</th>
                    <th className="text-center p-4">Idade</th>
                    <th className="text-center p-4">Tempo Empresa</th>
                    <th className="text-right p-4">Salário</th>
                    <th className="text-right p-4">Outros</th>
                    <th className="text-center p-4 w-[100px]">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {funcionarios.map((funcionario) => {
                    const idade = calcularIdade(funcionario.nascimento)
                    const proximoAniversario = calcularProximoAniversario(funcionario.nascimento)
                    const aniversarioEmpresa = calcularAniversarioEmpresa(funcionario.admissao)
                    
                    return (
                      <tr key={funcionario.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="p-4">
                          <div>
                            <p className="font-medium text-slate-800">{funcionario.nome_completo}</p>
                            <div className="flex items-center gap-3 mt-1">
                              {funcionario.matricula && (
                                <span className="text-xs text-slate-500">Mat: {funcionario.matricula}</span>
                              )}
                              {proximoAniversario && proximoAniversario.diasFaltando <= 30 && (
                                <span className="flex items-center gap-1 text-xs bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full">
                                  <Cake className="w-3 h-3" />
                                  {proximoAniversario.diasFaltando === 0 ? 'Hoje!' : `${proximoAniversario.diasFaltando}d`}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-slate-600 text-sm">{funcionario.empresa?.razao_social || '-'}</td>
                        <td className="p-4">
                          <div>
                            <p className="text-slate-700 text-sm">{funcionario.cargo?.nome || '-'}</p>
                            <p className="text-xs text-slate-400">{funcionario.setor?.nome || '-'}</p>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          {idade !== null ? (
                            <div>
                              <p className="font-medium text-slate-700">{idade} anos</p>
                              <p className="text-xs text-slate-400">{formatarData(funcionario.nascimento)}</p>
                            </div>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          <div>
                            <p className="font-medium text-slate-700">{calcularTempoEmpresa(funcionario.admissao)}</p>
                            <div className="flex items-center justify-center gap-1 mt-1">
                              <p className="text-xs text-slate-400">{formatarData(funcionario.admissao)}</p>
                              {aniversarioEmpresa && aniversarioEmpresa.diasFaltando <= 30 && (
                                <span className="flex items-center gap-1 text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">
                                  <Gift className="w-3 h-3" />
                                  {aniversarioEmpresa.anosCompletando}a
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-right tabular-nums font-medium text-slate-800">
                          {formatarMoeda(Number(funcionario.salario))}
                        </td>
                        <td className="p-4 text-right tabular-nums text-amber-600">
                          {Number(funcionario.outros_proventos || 0) > 0 
                            ? formatarMoeda(Number(funcionario.outros_proventos)) 
                            : '-'
                          }
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => abrirModalEditarComReset(funcionario)}
                              className="p-2 text-slate-500 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => funcionario.id && setConfirmExcluir(funcionario.id)}
                              className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Excluir"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Formulário */}
      <Modal
        aberto={modalAberto}
        onFechar={fecharModal}
        titulo={funcionarioEditando?.id ? 'Editar Funcionário' : 'Novo Funcionário'}
        largura="lg"
      >
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nome Completo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={funcionarioEditando?.nome_completo || ''}
                onChange={(e) => handleChange('nome_completo', e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none"
                placeholder="Nome completo do funcionário"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Empresa <span className="text-red-500">*</span>
              </label>
              <select
                value={funcionarioEditando?.empresa_id || ''}
                onChange={(e) => handleChange('empresa_id', e.target.value ? Number(e.target.value) : 0)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none bg-white"
              >
                <option value="">Selecione...</option>
                {empresas.map((e) => (
                  <option key={e.id} value={e.id}>{e.razao_social}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Matrícula
              </label>
              <input
                type="text"
                value={funcionarioEditando?.matricula || ''}
                onChange={(e) => handleChange('matricula', e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none"
                placeholder="Número de matrícula"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Data de Nascimento
              </label>
              <input
                type="date"
                value={funcionarioEditando?.nascimento || ''}
                onChange={(e) => handleChange('nascimento', e.target.value || null)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Data de Admissão <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={funcionarioEditando?.admissao || ''}
                onChange={(e) => handleChange('admissao', e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Cargo
              </label>
              <select
                value={funcionarioEditando?.cargo_id || ''}
                onChange={(e) => handleChange('cargo_id', e.target.value ? Number(e.target.value) : null)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none bg-white"
              >
                <option value="">Selecione...</option>
                {cargos.map((c) => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Setor
              </label>
              <select
                value={funcionarioEditando?.setor_id || ''}
                onChange={(e) => handleChange('setor_id', e.target.value || null)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none bg-white"
              >
                <option value="">Selecione...</option>
                {setores.map((s) => (
                  <option key={s.id} value={s.id}>{s.nome}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Salário (R$)
              </label>
              <input
                type="text"
                value={salarioTexto}
                onChange={(e) => setSalarioTexto(handleMoedaInput(e.target.value))}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none"
                placeholder="0,00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Outros Proventos (R$)
                <span className="text-xs text-slate-400 ml-1">(sem encargos)</span>
              </label>
              <input
                type="text"
                value={outrosProventosTexto}
                onChange={(e) => setOutrosProventosTexto(handleMoedaInput(e.target.value))}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                placeholder="0,00"
              />
            </div>
          </div>

          {/* Resumo de Informações (apenas na edição) */}
          {funcionarioEditando?.id && funcionarioEditando.admissao && (
            <div className="bg-slate-50 rounded-xl p-4 mt-4">
              <h4 className="text-sm font-medium text-slate-700 mb-3">Informações Calculadas</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-slate-500">Idade</p>
                  <p className="font-medium text-slate-800">
                    {funcionarioEditando.nascimento 
                      ? `${calcularIdade(funcionarioEditando.nascimento)} anos`
                      : '-'
                    }
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Tempo de Empresa</p>
                  <p className="font-medium text-slate-800">
                    {calcularTempoEmpresa(funcionarioEditando.admissao)}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Próx. Aniversário</p>
                  <p className="font-medium text-slate-800">
                    {funcionarioEditando.nascimento 
                      ? calcularProximoAniversario(funcionarioEditando.nascimento)?.data
                      : '-'
                    }
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Aniv. Empresa</p>
                  <p className="font-medium text-slate-800">
                    {calcularAniversarioEmpresa(funcionarioEditando.admissao)?.data}
                    <span className="text-violet-600 ml-1">
                      ({calcularAniversarioEmpresa(funcionarioEditando.admissao)?.anosCompletando}º ano)
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              onClick={fecharModal}
              className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={handleSalvar}
              disabled={salvando}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition-colors font-medium disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {salvando ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Diálogo de Confirmação */}
      <ConfirmDialog
        aberto={!!confirmExcluir}
        titulo="Excluir Funcionário"
        mensagem="Tem certeza que deseja excluir este funcionário? Esta ação não pode ser desfeita."
        onConfirmar={handleConfirmarExclusao}
        onCancelar={() => setConfirmExcluir(null)}
        labelConfirmar="Excluir"
        tipo="perigo"
      />
    </div>
  )
}