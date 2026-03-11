'use client'

import { Save } from 'lucide-react'
import { PagamentoExtra, Funcionario, TIPOS_PAGAMENTO_EXTRA } from '@/types/pessoas'
import { Modal } from '@/components/gestao-pessoas'
import { handleMoedaInput } from '@/utils/formatters'

const MESES = [
  { value: 1, label: 'Janeiro' }, { value: 2, label: 'Fevereiro' },
  { value: 3, label: 'Março' }, { value: 4, label: 'Abril' },
  { value: 5, label: 'Maio' }, { value: 6, label: 'Junho' },
  { value: 7, label: 'Julho' }, { value: 8, label: 'Agosto' },
  { value: 9, label: 'Setembro' }, { value: 10, label: 'Outubro' },
  { value: 11, label: 'Novembro' }, { value: 12, label: 'Dezembro' },
]

interface ModalPagamentoProps {
  aberto: boolean
  pagamento: PagamentoExtra | null
  valorTexto: string
  funcionarios: Funcionario[]
  salvando: boolean
  onFechar: () => void
  onSalvar: () => void
  onValorChange: (valor: string) => void
  onPagamentoChange: (campo: keyof PagamentoExtra, valor: string | number | null) => void
}

export function ModalPagamento({
  aberto,
  pagamento,
  valorTexto,
  funcionarios,
  salvando,
  onFechar,
  onSalvar,
  onValorChange,
  onPagamentoChange,
}: ModalPagamentoProps) {
  if (!pagamento) return null

  return (
    <Modal
      aberto={aberto}
      onFechar={onFechar}
      titulo={pagamento.id ? 'Editar Pagamento' : 'Novo Pagamento'}
      largura="md"
    >
      <div className="p-6 space-y-4">
        {/* Competência */}
        <div className="bg-orange-50 rounded-xl p-3 text-center">
          <p className="text-sm text-orange-600 font-medium">
            Competência: {MESES.find(m => m.value === pagamento.competencia_mes)?.label}/{pagamento.competencia_ano}
          </p>
        </div>

        {/* Funcionário */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Funcionário <span className="text-red-500">*</span>
          </label>
          <select
            value={pagamento.funcionario_id || ''}
            onChange={(e) => onPagamentoChange('funcionario_id', Number(e.target.value))}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none bg-white"
          >
            <option value="">Selecione...</option>
            {funcionarios.map((f) => (
              <option key={f.id} value={f.id}>
                {f.nome_completo} - {f.empresa?.razao_social}
              </option>
            ))}
          </select>
        </div>

        {/* Tipo */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Tipo <span className="text-red-500">*</span>
          </label>
          <select
            value={pagamento.tipo || 'outros'}
            onChange={(e) => onPagamentoChange('tipo', e.target.value)}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none bg-white"
          >
            {TIPOS_PAGAMENTO_EXTRA.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Valor */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Valor (R$) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={valorTexto}
              onChange={(e) => onValorChange(handleMoedaInput(e.target.value))}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
              placeholder="0,00"
            />
          </div>

          {/* Data Pagamento */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Data Pagamento
            </label>
            <input
              type="date"
              value={pagamento.data_pagamento || ''}
              onChange={(e) => onPagamentoChange('data_pagamento', e.target.value || null)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
            />
          </div>
        </div>

        {/* Descrição */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Descrição
          </label>
          <textarea
            value={pagamento.descricao || ''}
            onChange={(e) => onPagamentoChange('descricao', e.target.value || null)}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none resize-none"
            rows={2}
            placeholder="Detalhes do pagamento (opcional)"
          />
        </div>

        {/* Aviso */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-700">
          <strong>Atenção:</strong> Pagamentos extras não têm incidência de FGTS ou INSS.
        </div>

        <div className="flex gap-3 pt-4">
          <button
            onClick={onFechar}
            className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={onSalvar}
            disabled={salvando}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors font-medium disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {salvando ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </Modal>
  )
}