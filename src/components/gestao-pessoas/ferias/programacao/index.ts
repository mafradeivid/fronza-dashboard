// ============================================
// COMPONENTES: PROGRAMAÇÃO DE FÉRIAS
// ============================================

// Tipos
export type { FuncionarioAgrupado, EstadoFormulario } from './types'

// Componentes
export { BadgeSituacao } from './BadgeSituacao'
export { ResumoFinanceiro } from './ResumoFinanceiro'
export { CardFuncionario } from './CardFuncionario'
export { DetalhesFuncionario } from './DetalhesFuncionario'
export { FormularioProgramacao } from './FormularioProgramacao'
export { ModalFuncionario } from './ModalFuncionario'
export { ListaFuncionarios } from './ListaFuncionarios'
export { FiltrosProgramacaoBarra } from './FiltrosProgramacaoBarra'

// Utilitário: agrupar períodos por funcionário
import { PeriodoParaProgramacao, SITUACAO_CONFIG } from '@/types/ferias'
import { FuncionarioAgrupado } from './types'

export function agruparPorFuncionario(periodos: PeriodoParaProgramacao[]): FuncionarioAgrupado[] {
  const mapa = new Map<number, FuncionarioAgrupado>()

  periodos.forEach(p => {
    if (!mapa.has(p.funcionario_id)) {
      mapa.set(p.funcionario_id, {
        funcionario_id: p.funcionario_id,
        funcionario_nome: p.funcionario_nome,
        empresa_id: p.empresa_id,
        empresa_nome: p.empresa_nome,
        salario: p.salario,
        periodos: [],
        totalSaldo: 0,
        situacaoMaisUrgente: 'normal',
        temVencido: false,
        temCritico: false,
      })
    }

    const grupo = mapa.get(p.funcionario_id)!
    grupo.periodos.push(p)
    grupo.totalSaldo += p.saldo

    // Atualizar situação mais urgente
    if (p.situacao === 'vencido') {
      grupo.temVencido = true
      grupo.situacaoMaisUrgente = 'vencido'
    } else if (p.situacao === 'critico' && grupo.situacaoMaisUrgente !== 'vencido') {
      grupo.temCritico = true
      grupo.situacaoMaisUrgente = 'critico'
    } else if (p.situacao === 'atencao' && !['vencido', 'critico'].includes(grupo.situacaoMaisUrgente)) {
      grupo.situacaoMaisUrgente = 'atencao'
    }
  })

  // Ordenar por urgência
  return Array.from(mapa.values()).sort((a, b) => {
    const ordemA = SITUACAO_CONFIG[a.situacaoMaisUrgente].ordem
    const ordemB = SITUACAO_CONFIG[b.situacaoMaisUrgente].ordem
    return ordemA - ordemB
  })
}