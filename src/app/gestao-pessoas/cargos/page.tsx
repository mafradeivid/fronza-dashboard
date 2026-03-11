'use client'

import { useState } from 'react'
import { Briefcase, Plus, Pencil, Trash2, Save } from 'lucide-react'
import { useCargos } from '@/hooks/useCargos'
import { Cargo } from '@/types/pessoas'
import { PageHeader, Modal, EmptyState, LoadingState, ConfirmDialog } from '@/components/gestao-pessoas'

export default function CargosPage() {
  const {
    cargos,
    carregando,
    erro,
    modalAberto,
    cargoEditando,
    salvando,
    abrirModalCriar,
    abrirModalEditar,
    fecharModal,
    salvar,
    excluir,
    setCargoEditando,
    setErro,
  } = useCargos()

  const [confirmExcluir, setConfirmExcluir] = useState<number | null>(null)

  async function handleSalvar() {
    if (!cargoEditando) return
    if (!cargoEditando.nome.trim()) {
      setErro('Nome é obrigatório')
      return
    }
    await salvar(cargoEditando)
  }

  async function handleConfirmarExclusao() {
    if (confirmExcluir) {
      const sucesso = await excluir(confirmExcluir)
      if (sucesso) {
        setConfirmExcluir(null)
      }
    }
  }

  function handleChange(campo: keyof Cargo, valor: string) {
    if (cargoEditando) {
      setCargoEditando({ ...cargoEditando, [campo]: valor })
    }
  }

  if (carregando) {
    return <LoadingState mensagem="Carregando cargos..." cor="amber" />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <PageHeader
        titulo="Cadastro de Cargos"
        descricao="Gerencie os cargos e funções"
        icone={Briefcase}
        cor="amber"
        acaoPrincipal={{
          label: 'Novo Cargo',
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
          {cargos.length === 0 ? (
            <EmptyState
              titulo="Nenhum cargo cadastrado"
              descricao="Comece criando o primeiro cargo."
              icone={Briefcase}
              acao={{ label: 'Criar Cargo', onClick: abrirModalCriar }}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-800 text-white">
                  <tr>
                    <th className="text-left p-4">Nome</th>
                    <th className="text-center p-4 w-[100px]">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {cargos.map((cargo) => (
                    <tr key={cargo.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-4 font-medium text-slate-800">{cargo.nome}</td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => abrirModalEditar(cargo)}
                            className="p-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => cargo.id && setConfirmExcluir(cargo.id)}
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
        titulo={cargoEditando?.id ? 'Editar Cargo' : 'Novo Cargo'}
      >
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nome <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={cargoEditando?.nome || ''}
              onChange={(e) => handleChange('nome', e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
              placeholder="Nome do cargo"
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
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors font-medium disabled:opacity-50"
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
        titulo="Excluir Cargo"
        mensagem="Tem certeza que deseja excluir este cargo? Esta ação não pode ser desfeita."
        onConfirmar={handleConfirmarExclusao}
        onCancelar={() => setConfirmExcluir(null)}
        labelConfirmar="Excluir"
        tipo="perigo"
      />
    </div>
  )
}