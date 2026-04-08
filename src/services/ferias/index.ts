// ============================================
// SERVICES: SISTEMA DE FÉRIAS
// Re-exporta todos os services
// ============================================

// Períodos Aquisitivos
export {
  listarPeriodos,
  buscarPeriodo,
  buscarPeriodosFuncionario,
  buscarPeriodosComSaldo,
  gerarPeriodosFuncionario,
  gerarTodosPeriodos,
  atualizarStatusPeriodos,
  atualizarFaltas,
  atualizarDias,
  adicionarObservacao,
  buscarPeriodosVencendo,
  buscarPeriodosVencidos,
  contarParcelasUsadas,
} from './periodosService'

// Lançamentos de Férias
export {
  listarLancamentos,
  buscarLancamento,
  buscarLancamentosFuncionario,
  buscarLancamentosPeriodo,
  buscarFeriasEmAndamento,
  buscarFeriasProgramadas,
  criarLancamento,
  atualizarStatusLancamento,
  iniciarFerias,
  concluirFerias,
  cancelarLancamento,
  atualizarStatusAutomatico,
} from './lancamentosService'

// Saldos e Estatísticas
export {
  listarSaldos,
  buscarSaldoFuncionario,
  buscarComFeriasVencidas,
  buscarComAlertaVencimento,
  listarFeriasVencendo,
  buscarPeriodosCriticos,
  buscarPeriodosComAlerta,
  calcularEstatisticas,
  buscarFeriasCalendario,
  gerarResumoEmpresas,
} from './saldosService'
export type { EstatisticasFerias, FeriasCalendario, ResumoEmpresaFerias } from './saldosService'

// Férias Coletivas
export {
  listarFeriasColetivas,
  buscarFeriasColetivas,
  programarFeriasColetivas,
  atualizarStatusFeriasColetivas,
  iniciarFeriasColetivas,
  concluirFeriasColetivas,
  cancelarFeriasColetivas,
  adicionarFuncionario,
  removerFuncionario,
  buscarProximasFeriasColetivas,
} from './coletivosService'

// Funções Extras - Rede de Segurança
export {
  garantirPeriodosFuncionario,
  garantirPeriodosTodosFuncionariosAtivos,
  listarFuncionariosParaFerias,
} from './periodosExtras'

// Programação de Férias (NOVO)
export {
  listarPeriodosParaProgramacao,
  calcularProgramacao,
  validarProgramacao,
  salvarProgramacao,
  cancelarProgramacao,
  buscarFeriasCalendarioMensal,
  buscarEstatisticasProgramacao,
  buscarHistoricoFerias,
} from './programacaoService'