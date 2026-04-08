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

// Tipos de período de experiência (sempre somam 90 dias)
export type PeriodoExperiencia = '45+45' | '30+60' | '60+30'

export const PERIODOS_EXPERIENCIA: { value: PeriodoExperiencia; label: string; primeiro: number; segundo: number }[] = [
  { value: '45+45', label: '45 + 45 dias', primeiro: 45, segundo: 45 },
  { value: '30+60', label: '30 + 60 dias', primeiro: 30, segundo: 60 },
  { value: '60+30', label: '60 + 30 dias', primeiro: 60, segundo: 30 },
]

// Interface principal
export interface Funcionario {
  id?: number
  empresa_id: number
  nome_completo: string
  nascimento: string | null
  matricula: string | null
  cpf: string | null
  admissao: string
  cargo_id: number | null
  setor_id: string | null  // UUID
  salario: number
  outros_proventos: number
  
  // Período de experiência
  periodo_experiencia: PeriodoExperiencia | null
  
  // Campos de status/demissão
  status: StatusFuncionario
  tipo_demissao_id: number | null
  data_desligamento: string | null
  data_ultimo_dia: string | null
  
  // Timestamps
  created_at?: string
  updated_at?: string
  
  // Campos expandidos (joins)f
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
  cpf: null,
  admissao: '',
  cargo_id: null,
  setor_id: null,
  salario: 0,
  outros_proventos: 0,
  periodo_experiencia: '45+45', // Padrão mais comum
  status: 'ativo',
  tipo_demissao_id: null,
  data_desligamento: null,
  data_ultimo_dia: null,
}

// ============================================
// HELPERS DE STATUS
// ============================================

export function getLabelStatus(status: StatusFuncionario): string {
  return STATUS_FUNCIONARIO.find(s => s.value === status)?.label || status
}

export function getCorStatus(status: StatusFuncionario): string {
  return STATUS_FUNCIONARIO.find(s => s.value === status)?.cor || 'gray'
}

// ============================================
// HELPERS DE EXPERIÊNCIA
// ============================================

export interface DatasExperiencia {
  fimPrimeiroPeriodo: Date
  fimSegundoPeriodo: Date
  diasRestantesPrimeiro: number
  diasRestantesSegundo: number
  periodoAtual: 1 | 2 | 'encerrado'
}

/**
 * Calcula as datas de fim dos períodos de experiência
 */
export function calcularDatasExperiencia(
  dataAdmissao: string,
  periodoExperiencia: PeriodoExperiencia | null
): DatasExperiencia | null {
  if (!dataAdmissao || !periodoExperiencia) return null
  
  const config = PERIODOS_EXPERIENCIA.find(p => p.value === periodoExperiencia)
  if (!config) return null
  
  const admissao = new Date(dataAdmissao)
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  
  // Fim do 1º período = admissão + dias do primeiro período
  const fimPrimeiroPeriodo = new Date(admissao)
  fimPrimeiroPeriodo.setDate(fimPrimeiroPeriodo.getDate() + config.primeiro)
  
  // Fim do 2º período = admissão + 90 dias (total)
  const fimSegundoPeriodo = new Date(admissao)
  fimSegundoPeriodo.setDate(fimSegundoPeriodo.getDate() + 90)
  
  // Calcular dias restantes
  const msParaDias = (ms: number) => Math.floor(ms / (1000 * 60 * 60 * 24))
  
  const diasRestantesPrimeiro = msParaDias(fimPrimeiroPeriodo.getTime() - hoje.getTime())
  const diasRestantesSegundo = msParaDias(fimSegundoPeriodo.getTime() - hoje.getTime())
  
  // Determinar período atual
  let periodoAtual: 1 | 2 | 'encerrado'
  if (diasRestantesSegundo <= 0) {
    periodoAtual = 'encerrado'
  } else if (diasRestantesPrimeiro > 0) {
    periodoAtual = 1
  } else {
    periodoAtual = 2
  }
  
  return {
    fimPrimeiroPeriodo,
    fimSegundoPeriodo,
    diasRestantesPrimeiro: Math.max(0, diasRestantesPrimeiro),
    diasRestantesSegundo: Math.max(0, diasRestantesSegundo),
    periodoAtual,
  }
}

/**
 * Verifica se funcionário está em período de experiência
 */
export function estaEmExperiencia(funcionario: Funcionario): boolean {
  const datas = calcularDatasExperiencia(funcionario.admissao, funcionario.periodo_experiencia)
  return datas !== null && datas.periodoAtual !== 'encerrado'
}

/**
 * Retorna funcionários com experiência vencendo em X dias
 */
export function experienciaVencendoEm(
  funcionarios: Funcionario[],
  dias: number
): { funcionario: Funcionario; datas: DatasExperiencia; tipo: '1º período' | '2º período' }[] {
  const resultado: { funcionario: Funcionario; datas: DatasExperiencia; tipo: '1º período' | '2º período' }[] = []
  
  funcionarios.forEach(func => {
    if (func.status !== 'ativo') return
    
    const datas = calcularDatasExperiencia(func.admissao, func.periodo_experiencia)
    if (!datas || datas.periodoAtual === 'encerrado') return
    
    // Verifica 1º período
    if (datas.diasRestantesPrimeiro > 0 && datas.diasRestantesPrimeiro <= dias) {
      resultado.push({ funcionario: func, datas, tipo: '1º período' })
    }
    // Verifica 2º período (só se 1º já passou)
    else if (datas.periodoAtual === 2 && datas.diasRestantesSegundo > 0 && datas.diasRestantesSegundo <= dias) {
      resultado.push({ funcionario: func, datas, tipo: '2º período' })
    }
  })
  
  // Ordenar por dias restantes
  return resultado.sort((a, b) => {
    const diasA = a.tipo === '1º período' ? a.datas.diasRestantesPrimeiro : a.datas.diasRestantesSegundo
    const diasB = b.tipo === '1º período' ? b.datas.diasRestantesPrimeiro : b.datas.diasRestantesSegundo
    return diasA - diasB
  })
}

// ============================================
// HELPER DE COMPETÊNCIA
// ============================================

/**
 * Verifica se funcionário deve contar na competência
 */
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