'use client'

import { useRef } from 'react'
import { Save, CheckSquare, Square } from 'lucide-react'
import { Empresa, Funcionario, TIPOS_PAGAMENTO_EXTRA, TipoPagamentoExtra } from '@/types/pessoas'
import { Modal } from '@/components/gestao-pessoas'
import { formatarMoeda, handleMoedaInput, parseMoeda } from '@/utils/formatters'

const MESES = [
  { value: 1, label: 'Janeiro' }, { value: 2, label: 'Fevereiro' },
  { value: 3, label: 'Março' }, { value: 4, label: 'Abril' },
  { value: 5, label: 'Maio' }, { value: 6, label: 'Junho' },
  { value: 7, label: 'Julho' }, { value: 8, label: 'Agosto' },
  { value: 9, label: 'Setembro' }, { value: 10, label: 'Outubro' },
  { value: 11, label: 'Novembro' }, { value: 12, label: 'Dezembro' },
]

interface ModalLoteProps {
  aberto: boolean
  competenciaMes: number
  competenciaAno: number
  
  // Configurações
  tipo: TipoPagamentoExtra
  descricao: string
  dataPagamento: string
  onTipoChange: (tipo: TipoPagamentoExtra) => void
  onDescricaoChange: (descricao: string) => void
  onDataPagamentoChange: (data: string) => void
  
  // Filtros
  filtroEmpresa: number | null
  busca: string
  empresas: Empresa[]
  onFiltroEmpresaChange: (empresa: number | null) => void
  onBuscaChange: (busca: string) => void
  
  // Funcionários e itens
  funcionariosFiltrados: Funcionario[]
  getItem: (id: number) => { selecionado: boolean; valor: number } | undefined
  getValorTexto: (id: number) => string
  onToggleSelecionar: (id: number) => void
  onSelecionarTodos: () => void
  onDeselecionarTodos: () => void
  onAtualizarValor: (id: number, valor: number, valorTexto: string) => void
  onAplicarValorTodos: (valor: number, valorTexto: string) => void
  
  // Resumo
  quantidadeSelecionados: number
  total: number
  
  // Ações
  salvando: boolean
  onFechar: () => void
  onSalvar: () => void
}

export function ModalLote({
  aberto,
  competenciaMes,
  competenciaAno,
  tipo,
  descricao,
  dataPagamento,
  onTipoChange,
  onDescricaoChange,
  onDataPagamentoChange,
  filtroEmpresa,
  busca,
  empresas,
  onFiltroEmpresaChange,
  onBuscaChange,
  funcionariosFiltrados,
  getItem,
  getValorTexto,
  onToggleSelecionar,
  onSelecionarTodos,
  onDeselecionarTodos,
  onAtualizarValor,
  onAplicarValorTodos,
  quantidadeSelecionados,
  total,
  salvando,
  onFechar,
  onSalvar,
}: ModalLoteProps) {
  const inputRefs = useRef<Map<number, HTMLInputElement>>(new Map())
  const valorMassaRef = useRef<string>('')

  // Navegação com TAB/Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Tab' || e.key === 'Enter') {
      if (!e.shiftKey) {
        const proximoIndex = index + 1
        if (proximoIndex < funcionariosFiltrados.length) {
          e.preventDefault()
          const proximoId = funcionariosFiltrados[proximoIndex].id!
          inputRefs.current.get(proximoId)?.focus()
          inputRefs.current.get(proximoId)?.select()
        }
      } else if (e.key === 'Tab') {
        const anteriorIndex = index - 1
        if (anteriorIndex >= 0) {
          e.preventDefault()
          const anteriorId = funcionariosFiltrados[anteriorIndex].id!
          inputRefs.current.get(anteriorId)?.focus()
          inputRefs.current.get(anteriorId)?.select()
        }
      }
    }
  }

  // Atualizar valor
  const handleValorChange = (funcionarioId: number, valorStr: string) => {
    const valorFormatado = handleMoedaInput(valorStr)
    const valorNumerico = parseMoeda(valorFormatado)
    onAtualizarValor(funcionarioId, valorNumerico, valorFormatado)
  }

  // Aplicar valor em massa
  const handleAplicarMassa = () => {
    const valor = parseMoeda(valorMassaRef.current)
    if (valor > 0) {
      const valorFormatado = valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
      onAplicarValorTodos(valor, valorFormatado)
    }
  }

  // Verificar se todos estão selecionados
  const todosSelecionados = funcionariosFiltrados.length > 0 && 
    funcionariosFiltrados.every(f => getItem(f.id!)?.selecionado)

  return (
    <Modal
      aberto={aberto}
      onFechar={onFechar}
      titulo="Lançamento em Lote"
      largura="xl"
    >
      <div className="p-6">
        {/* Competência */}
        <div className="bg-orange-50 rounded-xl p-3 text-center mb-4">
          <p className="text-sm text-orange-600 font-medium">
            Competência: {MESES.find(m => m.value === competenciaMes)?.label}/{competenciaAno}
          </p>
        </div>

        {/* Configurações do Lote */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Tipo <span className="text-red-500">*</span>
            </label>
            <select
              value={tipo}
              onChange={(e) => onTipoChange(e.target.value as TipoPagamentoExtra)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none bg-white"
            >
              {TIPOS_PAGAMENTO_EXTRA.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Data Pagamento
            </label>
            <input
              type="date"
              value={dataPagamento}
              onChange={(e) => onDataPagamentoChange(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Descrição (para todos)
            </label>
            <input
              type="text"
              value={descricao}
              onChange={(e) => onDescricaoChange(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
              placeholder="Opcional"
            />
          </div>
        </div>

        {/* Filtros e Ações em Massa */}
        <div className="flex flex-col md:flex-row gap-4 mb-4 p-4 bg-slate-50 rounded-xl">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Filtrar por Empresa
            </label>
            <select
              value={filtroEmpresa || ''}
              onChange={(e) => onFiltroEmpresaChange(e.target.value ? Number(e.target.value) : null)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none bg-white"
            >
              <option value="">Todas as Empresas</option>
              {empresas.map((e) => (
                <option key={e.id} value={e.id}>{e.razao_social}</option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Buscar Funcionário
            </label>
            <input
              type="text"
              value={busca}
              onChange={(e) => onBuscaChange(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
              placeholder="Nome ou matrícula..."
            />
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Aplicar valor aos selecionados
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                onChange={(e) => {
                  valorMassaRef.current = handleMoedaInput(e.target.value)
                  e.target.value = valorMassaRef.current
                }}
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                placeholder="0,00"
              />
              <button
                onClick={handleAplicarMassa}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>

        {/* Ações de Seleção */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex gap-2">
            <button
              onClick={onSelecionarTodos}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <CheckSquare className="w-4 h-4" />
              Selecionar Todos ({funcionariosFiltrados.length})
            </button>
            <button
              onClick={onDeselecionarTodos}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Square className="w-4 h-4" />
              Limpar Seleção
            </button>
          </div>
          <p className="text-sm text-slate-500">
            Use <kbd className="px-1.5 py-0.5 bg-slate-200 rounded text-xs">TAB</kbd> ou <kbd className="px-1.5 py-0.5 bg-slate-200 rounded text-xs">Enter</kbd> para navegar
          </p>
        </div>

        {/* Lista de Funcionários */}
        <div className="border border-slate-200 rounded-xl overflow-hidden max-h-[400px] overflow-y-auto">
          <table className="w-full">
            <thead className="bg-slate-800 text-white sticky top-0">
              <tr>
                <th className="text-center p-3 w-[50px]">
                  <input
                    type="checkbox"
                    checked={todosSelecionados}
                    onChange={(e) => e.target.checked ? onSelecionarTodos() : onDeselecionarTodos()}
                    className="w-4 h-4 rounded"
                  />
                </th>
                <th className="text-left p-3">Funcionário</th>
                <th className="text-left p-3">Empresa</th>
                <th className="text-right p-3 w-[180px]">Valor (R$)</th>
              </tr>
            </thead>
            <tbody>
              {funcionariosFiltrados.map((funcionario, index) => {
                const item = getItem(funcionario.id!)
                if (!item) return null

                return (
                  <tr
                    key={funcionario.id}
                    className={`border-b border-slate-100 hover:bg-slate-50 ${item.selecionado ? 'bg-orange-50' : ''}`}
                  >
                    <td className="p-3 text-center">
                      <input
                        type="checkbox"
                        checked={item.selecionado}
                        onChange={() => onToggleSelecionar(funcionario.id!)}
                        className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500"
                      />
                    </td>
                    <td className="p-3">
                      <p className="font-medium text-slate-800">{funcionario.nome_completo}</p>
                      {funcionario.cargo && (
                        <p className="text-xs text-slate-500">{funcionario.cargo.nome}</p>
                      )}
                    </td>
                    <td className="p-3 text-slate-600 text-sm">
                      {funcionario.empresa?.razao_social}
                    </td>
                    <td className="p-3">
                      <input
                        ref={(el) => {
                          if (el) inputRefs.current.set(funcionario.id!, el)
                        }}
                        type="text"
                        value={getValorTexto(funcionario.id!)}
                        onChange={(e) => handleValorChange(funcionario.id!, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        onFocus={(e) => e.target.select()}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-right tabular-nums"
                        placeholder="0,00"
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Resumo */}
        <div className="mt-4 p-4 bg-slate-800 text-white rounded-xl flex items-center justify-between">
          <div>
            <p className="text-slate-300 text-sm">Selecionados com valor</p>
            <p className="text-2xl font-bold">{quantidadeSelecionados} funcionário(s)</p>
          </div>
          <div className="text-right">
            <p className="text-slate-300 text-sm">Total a lançar</p>
            <p className="text-2xl font-bold text-orange-400">{formatarMoeda(total)}</p>
          </div>
        </div>

        {/* Botões */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={onFechar}
            className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={onSalvar}
            disabled={salvando || quantidadeSelecionados === 0}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors font-medium disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {salvando ? 'Salvando...' : `Lançar ${quantidadeSelecionados} Pagamento(s)`}
          </button>
        </div>
      </div>
    </Modal>
  )
}