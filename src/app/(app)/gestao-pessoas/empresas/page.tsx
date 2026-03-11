'use client'

import { useState } from 'react'
import { Building2, Plus, Pencil, Trash2, Save } from 'lucide-react'
import { useEmpresas } from '@/hooks/useEmpresas'
import { Empresa, OPCOES_TRIBUTARIAS, OpcaoTributaria } from '@/types/pessoas'
import { PageHeader, Modal, EmptyState, LoadingState, ConfirmDialog } from '@/components/gestao-pessoas'
import { formatarCNPJ, handlePercentualInput, parsePercentual } from '@/utils/formatters'

export default function EmpresasPage() {
  const {
    empresas,
    carregando,
    erro,
    modalAberto,
    empresaEditando,
    salvando,
    abrirModalCriar,
    abrirModalEditar,
    fecharModal,
    salvar,
    excluir,
    setEmpresaEditando,
    setErro,
  } = useEmpresas()

  const [confirmExcluir, setConfirmExcluir] = useState<number | null>(null)

  // Campos de texto para percentuais (para permitir digitação com vírgula)
  const [inssTexto, setInssTexto] = useState('')
  const [provisaoTexto, setProvisaoTexto] = useState('')

  function abrirModalCriarComReset() {
    setInssTexto('')
    setProvisaoTexto('')
    abrirModalCriar()
  }

  function abrirModalEditarComReset(empresa: Empresa) {
    setInssTexto(String(empresa.aliquota_inss).replace('.', ','))
    setProvisaoTexto(String(empresa.aliquota_provisao_rescisao).replace('.', ','))
    abrirModalEditar(empresa)
  }

  async function handleSalvar() {
    if (!empresaEditando) return
    
    if (!empresaEditando.razao_social.trim()) {
      setErro('Razão Social é obrigatória')
      return
    }
    if (!empresaEditando.cnpj.trim()) {
      setErro('CNPJ é obrigatório')
      return
    }

    // Converter percentuais de texto para número
    const empresaParaSalvar = {
      ...empresaEditando,
      aliquota_inss: parsePercentual(inssTexto),
      aliquota_provisao_rescisao: parsePercentual(provisaoTexto),
    }

    await salvar(empresaParaSalvar)
  }

  async function handleConfirmarExclusao() {
    if (confirmExcluir) {
      const sucesso = await excluir(confirmExcluir)
      if (sucesso) {
        setConfirmExcluir(null)
      }
    }
  }

  function handleChange(campo: keyof Empresa, valor: string | number) {
    if (empresaEditando) {
      setEmpresaEditando({ ...empresaEditando, [campo]: valor })
    }
  }

  if (carregando) {
    return <LoadingState mensagem="Carregando empresas..." cor="blue" />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <PageHeader
        titulo="Cadastro de Empresas"
        descricao="Gerencie as empresas e configurações tributárias"
        icone={Building2}
        cor="blue"
        acaoPrincipal={{
          label: 'Nova Empresa',
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

        {/* Tabela */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          {empresas.length === 0 ? (
            <EmptyState
              titulo="Nenhuma empresa cadastrada"
              descricao="Comece cadastrando a primeira empresa."
              icone={Building2}
              acao={{ label: 'Criar Empresa', onClick: abrirModalCriarComReset }}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-800 text-white">
                  <tr>
                    <th className="text-left p-4">Razão Social</th>
                    <th className="text-left p-4">CNPJ</th>
                    <th className="text-left p-4">IE</th>
                    <th className="text-left p-4">Opção Tributária</th>
                    <th className="text-right p-4">INSS (%)</th>
                    <th className="text-right p-4">Provisão Rescisão (%)</th>
                    <th className="text-center p-4 w-[100px]">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {empresas.map((empresa) => (
                    <tr key={empresa.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-4 font-medium text-slate-800">{empresa.razao_social}</td>
                      <td className="p-4 text-slate-600 font-mono text-sm">{empresa.cnpj}</td>
                      <td className="p-4 text-slate-600 text-sm">{empresa.inscricao_estadual || '-'}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          empresa.opcao_tributaria === 'simples_nacional' 
                            ? 'bg-green-100 text-green-700' 
                            : empresa.opcao_tributaria === 'presumido' 
                              ? 'bg-amber-100 text-amber-700' 
                              : 'bg-blue-100 text-blue-700'
                        }`}>
                          {OPCOES_TRIBUTARIAS.find(o => o.value === empresa.opcao_tributaria)?.label}
                        </span>
                      </td>
                      <td className="p-4 text-right tabular-nums">
                        {Number(empresa.aliquota_inss).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}%
                      </td>
                      <td className="p-4 text-right tabular-nums">
                        {Number(empresa.aliquota_provisao_rescisao).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}%
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => abrirModalEditarComReset(empresa)}
                            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => empresa.id && setConfirmExcluir(empresa.id)}
                            className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
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
        titulo={empresaEditando?.id ? 'Editar Empresa' : 'Nova Empresa'}
        largura="lg"
      >
        <div className="p-6 space-y-4">
          {/* Razão Social */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Razão Social <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={empresaEditando?.razao_social || ''}
              onChange={(e) => handleChange('razao_social', e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Nome da empresa"
            />
          </div>

          {/* CNPJ e IE lado a lado */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                CNPJ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={empresaEditando?.cnpj || ''}
                onChange={(e) => handleChange('cnpj', formatarCNPJ(e.target.value))}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono"
                placeholder="00.000.000/0000-00"
                maxLength={18}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Inscrição Estadual
              </label>
              <input
                type="text"
                value={empresaEditando?.inscricao_estadual || ''}
                onChange={(e) => handleChange('inscricao_estadual', e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Opcional"
              />
            </div>
          </div>

          {/* Opção Tributária */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Opção Tributária <span className="text-red-500">*</span>
            </label>
            <select
              value={empresaEditando?.opcao_tributaria || 'simples_nacional'}
              onChange={(e) => handleChange('opcao_tributaria', e.target.value as OpcaoTributaria)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
            >
              {OPCOES_TRIBUTARIAS.map((opcao) => (
                <option key={opcao.value} value={opcao.value}>
                  {opcao.label}
                </option>
              ))}
            </select>
          </div>

          {/* Alíquotas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Alíquota INSS (%)
              </label>
              <input
                type="text"
                value={inssTexto}
                onChange={(e) => setInssTexto(handlePercentualInput(e.target.value))}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="0,00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Provisão Rescisão (%)
              </label>
              <input
                type="text"
                value={provisaoTexto}
                onChange={(e) => setProvisaoTexto(handlePercentualInput(e.target.value))}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="0,00"
              />
            </div>
          </div>

          {/* Botões */}
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
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
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
        titulo="Excluir Empresa"
        mensagem="Tem certeza que deseja excluir esta empresa? Todos os funcionários vinculados também serão removidos."
        onConfirmar={handleConfirmarExclusao}
        onCancelar={() => setConfirmExcluir(null)}
        labelConfirmar="Excluir"
        tipo="perigo"
      />
    </div>
  )
}