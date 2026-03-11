'use client'

import { useState } from 'react'
import { FolderTree, Plus, Pencil, Trash2, Save } from 'lucide-react'
import { useSetores } from '@/hooks/useSetores'
import { Setor } from '@/types/pessoas'
import { PageHeader, Modal, EmptyState, LoadingState, ConfirmDialog } from '@/components/gestao-pessoas'

export default function SetoresPage() {
  const {
    setores,
    carregando,
    erro,
    modalAberto,
    setorEditando,
    salvando,
    abrirModalCriar,
    abrirModalEditar,
    fecharModal,
    salvar,
    excluir,
    setSetorEditando,
    setErro,
  } = useSetores()

  const [confirmExcluir, setConfirmExcluir] = useState<string | null>(null)

  async function handleSalvar() {
    if (!setorEditando) return
    if (!setorEditando.nome.trim()) {
      setErro('Nome é obrigatório')
      return
    }
    await salvar(setorEditando)
  }

  async function handleConfirmarExclusao() {
    if (confirmExcluir) {
      const sucesso = await excluir(confirmExcluir)
      if (sucesso) {
        setConfirmExcluir(null)
      }
    }
  }

  function handleChange(campo: keyof Setor, valor: string) {
    if (setorEditando) {
      setSetorEditando({ ...setorEditando, [campo]: valor })
    }
  }

  if (carregando) {
    return <LoadingState mensagem="Carregando setores..." cor="emerald" />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <PageHeader
        titulo="Cadastro de Setores"
        descricao="Gerencie os setores e departamentos"
        icone={FolderTree}
        cor="emerald"
        acaoPrincipal={{
          label: 'Novo Setor',
          onClick: abrirModalCriar,
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
          {setores.length === 0 ? (
            <EmptyState
              titulo="Nenhum setor cadastrado"
              descricao="Comece criando o primeiro setor."
              icone={FolderTree}
              acao={{ label: 'Criar Setor', onClick: abrirModalCriar }}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-800 text-white">
                  <tr>
                    <th className="text-left p-4">Nome</th>
                    <th className="text-left p-4">Descrição</th>
                    <th className="text-center p-4 w-[100px]">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {setores.map((setor) => (
                    <tr key={setor.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-4 font-medium text-slate-800">{setor.nome}</td>
                      <td className="p-4 text-slate-600">{setor.descricao || '-'}</td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => abrirModalEditar(setor)}
                            className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setor.id && setConfirmExcluir(setor.id)}
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
        titulo={setorEditando?.id ? 'Editar Setor' : 'Novo Setor'}
      >
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nome <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={setorEditando?.nome || ''}
              onChange={(e) => handleChange('nome', e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              placeholder="Nome do setor"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Descrição
            </label>
            <textarea
              value={setorEditando?.descricao || ''}
              onChange={(e) => handleChange('descricao', e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none"
              placeholder="Descrição do setor (opcional)"
              rows={3}
            />
          </div>

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
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50"
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
        titulo="Excluir Setor"
        mensagem="Tem certeza que deseja excluir este setor? Esta ação não pode ser desfeita."
        onConfirmar={handleConfirmarExclusao}
        onCancelar={() => setConfirmExcluir(null)}
        labelConfirmar="Excluir"
        tipo="perigo"
      />
    </div>
  )
}