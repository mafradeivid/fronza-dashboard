// ============================================
// PAGAMENTO EXTRA
// ============================================

import { Funcionario } from './funcionario'

export type TipoPagamentoExtra = 
  | 'horas_extras'
  | 'bonificacao'
  | 'adiantamento'
  | 'ajuda_custo'
  | 'comissao'
  | 'outros'

export const TIPOS_PAGAMENTO_EXTRA: { value: TipoPagamentoExtra; label: string }[] = [
  { value: 'horas_extras', label: 'Horas Extras' },
  { value: 'bonificacao', label: 'Bonificação / Premiação' },
  { value: 'adiantamento', label: 'Adiantamento' },
  { value: 'ajuda_custo', label: 'Ajuda de Custo' },
  { value: 'comissao', label: 'Comissão' },
  { value: 'outros', label: 'Outros' },
]

export interface PagamentoExtra {
  id?: number
  funcionario_id: number
  tipo: TipoPagamentoExtra
  descricao: string | null
  valor: number
  competencia_mes: number
  competencia_ano: number
  data_pagamento: string | null
  created_at?: string
  updated_at?: string
  // Campos expandidos (joins)
  funcionario?: Funcionario
}

export const PAGAMENTO_EXTRA_INICIAL: PagamentoExtra = {
  funcionario_id: 0,
  tipo: 'outros',
  descricao: null,
  valor: 0,
  competencia_mes: new Date().getMonth() + 1,
  competencia_ano: new Date().getFullYear(),
  data_pagamento: null,
}

// Helpers
export function getLabelTipoPagamento(tipo: TipoPagamentoExtra): string {
  return TIPOS_PAGAMENTO_EXTRA.find(t => t.value === tipo)?.label || tipo
}

export function getCompetenciaLabel(mes: number, ano: number): string {
  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  return `${meses[mes - 1]}/${ano}`
}