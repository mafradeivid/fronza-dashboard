// ============================================
// SETOR
// ============================================

export interface Setor {
  id?: string  // UUID
  nome: string
  descricao?: string | null
  created_at?: string
  updated_at?: string
}

export const SETOR_INICIAL: Setor = {
  nome: '',
  descricao: '',
}