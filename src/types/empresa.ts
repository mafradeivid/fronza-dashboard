// ============================================
// EMPRESA
// ============================================

export interface Empresa {
  id?: number
  razao_social: string
  cnpj: string
  opcao_tributaria: OpcaoTributaria
  aliquota_inss: number
  aliquota_provisao_rescisao: number
  inscricao_estadual?: string | null
  created_at?: string
  updated_at?: string
}

export type OpcaoTributaria = 'simples_nacional' | 'presumido' | 'real'

export const OPCOES_TRIBUTARIAS: { value: OpcaoTributaria; label: string }[] = [
  { value: 'simples_nacional', label: 'Simples Nacional' },
  { value: 'presumido', label: 'Lucro Presumido' },
  { value: 'real', label: 'Lucro Real' },
]

export const EMPRESA_INICIAL: Empresa = {
  razao_social: '',
  cnpj: '',
  opcao_tributaria: 'simples_nacional',
  aliquota_inss: 0,
  aliquota_provisao_rescisao: 0,
}