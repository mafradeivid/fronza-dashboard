// ============================================
// TIPOS: PROGRAMAÇÃO DE FÉRIAS (COMPONENTES)
// ============================================

import { PeriodoParaProgramacao, SituacaoPeriodo } from '@/types/ferias'

/**
 * Funcionário com períodos agrupados
 */
export interface FuncionarioAgrupado {
  funcionario_id: number
  funcionario_nome: string
  empresa_id: number
  empresa_nome: string
  salario: number
  periodos: PeriodoParaProgramacao[]
  totalSaldo: number
  situacaoMaisUrgente: SituacaoPeriodo
  temVencido: boolean
  temCritico: boolean
}

/**
 * Estado do formulário de programação
 */
export interface EstadoFormulario {
  diasGozo: number
  diasAbono: number
  dataInicio: string
  erro: string | null
}

/**
 * Props comuns para componentes de programação
 */
export interface PropsComFuncionario {
  funcionario: FuncionarioAgrupado
}