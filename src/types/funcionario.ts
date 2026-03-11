// ============================================
// FUNCIONÁRIO
// ============================================

import { Empresa } from './empresa'
import { Setor } from './setor'
import { Cargo } from './cargo'
import { TipoDemissao } from './tipoDemissao'

// Status do funcionário
export type StatusFuncionario = 'ativo' | 'inativo' | 'afastado'

export const STATUS_FUNCIONARIO: { value: StatusFuncionario; label: string; cor: string }[] = [
  { value: 'ativo', label: 'Ativo', cor: 'green' },
  { value: 'inativo', label: 'Inativo', cor: 'red' },
  { value: 'afastado', label: 'Afastado', cor: 'amber' },
]

// Interface principal
export interface Funcionario {
  id?: number
  empresa_id: number
  nome_completo: string
  nascimento: string | null
  matricula: string | null
  admissao: string
  cargo_id: number | null
  setor_id: string | null  // UUID
  salario: number
  outros_proventos: number
  
  // Campos de status/demissão
  status: StatusFuncionario
  tipo_demissao_id: number | null
  data_desligamento: string | null
  data_ultimo_dia: string | null
  
  // Timestamps
  created_at?: string
  updated_at?: string
  
  // Campos expandidos (joins)
  empresa?: Empresa
  cargo?: Cargo
  setor?: Setor
  tipo_demissao?: TipoDemissao
}

// Dados para registrar demissão
export interface DadosDemissao {
  tipo_demissao_id: number
  data_desligamento: string
  data_ultimo_dia: string
}

// Estado inicial para formulários
export const FUNCIONARIO_INICIAL: Funcionario = {
  empresa_id: 0,
  nome_completo: '',
  nascimento: null,
  matricula: null,
  admissao: '',
  cargo_id: null,
  setor_id: null,
  salario: 0,
  outros_proventos: 0,
  status: 'ativo',
  tipo_demissao_id: null,
  data_desligamento: null,
  data_ultimo_dia: null,
}

// Helpers
export function getLabelStatus(status: StatusFuncionario): string {
  return STATUS_FUNCIONARIO.find(s => s.value === status)?.label || status
}

export function getCorStatus(status: StatusFuncionario): string {
  return STATUS_FUNCIONARIO.find(s => s.value === status)?.cor || 'gray'
}

// Verifica se funcionário deve contar na competência
export function funcionarioAtivoNaCompetencia(
  funcionario: Funcionario,
  mes: number,
  ano: number
): boolean {
  // Se não tem data_ultimo_dia, está ativo
  if (!funcionario.data_ultimo_dia) return true
  
  // Primeiro dia da competência
  const primeiroDiaCompetencia = new Date(ano, mes - 1, 1)
  const dataUltimoDia = new Date(funcionario.data_ultimo_dia)
  
  // Se data_ultimo_dia >= primeiro dia da competência, conta
  return dataUltimoDia >= primeiroDiaCompetencia
}