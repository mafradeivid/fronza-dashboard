// ============================================
// CARGO
// ============================================

export interface Cargo {
  id?: number
  nome: string
  created_at?: string
}

export const CARGO_INICIAL: Cargo = {
  nome: '',
}