// ============================================
// SERVICES: CUSTOS
// Re-exportação centralizada
// ============================================

// Types internos (proporcionalidade)
export type {
  Competencia,
  DadosProporcionalidade,
  EncargosCalculados,
} from './types'

// Constantes
export {
  ALIQUOTA_FGTS,
  MESES_ANO,
  DIAS_MES_COMERCIAL,
} from './constantesCusto'

// Proporcionalidade
export {
  funcionarioAtivoNaCompetencia,
  calcularProporcionalidade,
} from './calculoProporcional'

// Encargos
export { calcularEncargosFuncionario } from './calculoEncargos'

// Agregação
export {
  criarResumoVazio,
  encargosParaResumo,
  somarResumos,
  calcularTotais,
  calcularVariacao,
  ordenarPorCusto,
  calcularPercentual,
} from './agregacaoCustos'

// Service principal
export {
  calcularCustoPessoal,
  exportarCustoPessoalExcel,
} from './custoPessoalService'