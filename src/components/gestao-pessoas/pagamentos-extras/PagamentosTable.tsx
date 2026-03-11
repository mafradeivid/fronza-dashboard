'use client'

import { Pencil, Trash2, Printer, Wallet } from 'lucide-react'
import { PagamentoExtra, getLabelTipoPagamento } from '@/types/pessoas'
import { EmptyState } from '@/components/gestao-pessoas'
import { formatarMoeda, formatarData } from '@/utils/formatters'

// Cores por tipo
const CORES_TIPO: Record<string, { bg: string; text: string }> = {
  horas_extras: { bg: 'bg-blue-100', text: 'text-blue-700' },
  bonificacao: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  adiantamento: { bg: 'bg-amber-100', text: 'text-amber-700' },
  ajuda_custo: { bg: 'bg-purple-100', text: 'text-purple-700' },
  comissao: { bg: 'bg-pink-100', text: 'text-pink-700' },
  outros: { bg: 'bg-slate-100', text: 'text-slate-700' },
}

interface PagamentosTableProps {
  pagamentos: PagamentoExtra[]
  temFiltrosAtivos: boolean
  competenciaLabel: string
  selecionados: Set<number>
  onToggleSelecao: (id: number) => void
  onSelecionarTodos: () => void
  onDeselecionarTodos: () => void
  onEditar: (pagamento: PagamentoExtra) => void
  onExcluir: (id: number) => void
  onImprimir: (pagamento: PagamentoExtra) => void
  onNovo: () => void
}

export function PagamentosTable({
  pagamentos,
  temFiltrosAtivos,
  competenciaLabel,
  selecionados,
  onToggleSelecao,
  onSelecionarTodos,
  onDeselecionarTodos,
  onEditar,
  onExcluir,
  onImprimir,
  onNovo,
}: PagamentosTableProps) {
  const total = pagamentos.reduce((acc, p) => acc + Number(p.valor), 0)
  const todosSelecionados = pagamentos.length > 0 && pagamentos.every(p => selecionados.has(p.id!))

  if (pagamentos.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        <EmptyState
          titulo={temFiltrosAtivos ? "Nenhum pagamento encontrado" : "Nenhum pagamento registrado"}
          descricao={temFiltrosAtivos 
            ? "Tente ajustar os filtros." 
            : `Registre pagamentos extras para ${competenciaLabel}.`
          }
          icone={Wallet}
          acao={temFiltrosAtivos ? undefined : { label: 'Novo Pagamento', onClick: onNovo }}
        />
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-800 text-white">
            <tr>
              <th className="text-center p-4 w-[50px]">
                <input
                  type="checkbox"
                  checked={todosSelecionados}
                  onChange={(e) => e.target.checked ? onSelecionarTodos() : onDeselecionarTodos()}
                  className="w-4 h-4 rounded"
                />
              </th>
              <th className="text-left p-4">Funcionário</th>
              <th className="text-left p-4">Tipo</th>
              <th className="text-left p-4">Descrição</th>
              <th className="text-right p-4">Valor</th>
              <th className="text-center p-4">Data Pagamento</th>
              <th className="text-center p-4 w-[140px]">Ações</th>
            </tr>
          </thead>
          <tbody>
            {pagamentos.map((pagamento) => {
              const cores = CORES_TIPO[pagamento.tipo] || CORES_TIPO.outros
              const estaSelecionado = selecionados.has(pagamento.id!)
              
              return (
                <tr 
                  key={pagamento.id} 
                  className={`border-b border-slate-100 hover:bg-slate-50 ${estaSelecionado ? 'bg-orange-50' : ''}`}
                >
                  <td className="p-4 text-center">
                    <input
                      type="checkbox"
                      checked={estaSelecionado}
                      onChange={() => onToggleSelecao(pagamento.id!)}
                      className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500"
                    />
                  </td>
                  <td className="p-4">
                    <div>
                      <p className="font-medium text-slate-800">{pagamento.funcionario?.nome_completo}</p>
                      <p className="text-xs text-slate-500">{pagamento.funcionario?.empresa?.razao_social}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${cores.bg} ${cores.text}`}>
                      {getLabelTipoPagamento(pagamento.tipo)}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600 text-sm max-w-[200px] truncate">
                    {pagamento.descricao || '-'}
                  </td>
                  <td className="p-4 text-right tabular-nums font-semibold text-slate-800">
                    {formatarMoeda(Number(pagamento.valor))}
                  </td>
                  <td className="p-4 text-center text-slate-600">
                    {pagamento.data_pagamento ? formatarData(pagamento.data_pagamento) : '-'}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => onImprimir(pagamento)}
                        className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Imprimir Recibo"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEditar(pagamento)}
                        className="p-2 text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => pagamento.id && onExcluir(pagamento.id)}
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
          <tfoot className="bg-slate-100">
            <tr className="font-bold">
              <td className="p-4" colSpan={4}>
                Total ({pagamentos.length} pagamentos)
              </td>
              <td className="p-4 text-right tabular-nums text-orange-600">
                {formatarMoeda(total)}
              </td>
              <td colSpan={2}></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}