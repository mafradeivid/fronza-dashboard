// ============================================
// UTILS: CÁLCULOS TRABALHISTAS
// Re-exportação centralizada
// ============================================

// Funções de dias do mês
export {
  ehAnoBissexto,
  diasNoMes,
  obterDivisor,
  calcularDiasTrabalhados,
  calcularMesesTrabalhados,
  calcularMesesNoAno,
  extrairAnoMes,
} from './diasMes'

// Cálculos de salário proporcional
export {
  calcularSalarioAdmissao,
  calcularSaldoSalario,
  calcularDescontoFalta,
  calcularProporcional,
} from './salarioProporcional'

// Cálculos de férias
export {
  calcularFeriasProporcionais,
  calcularFeriasPorMeses,
  calcularFeriasVencidas,
  calcularFeriasEmDobro,
  calcularAbonoPecuniario,
} from './feriasProporcional'

// Cálculos de 13º salário
export {
  calcular13Proporcional,
  calcular13PorMeses,
  calcular13PrimeiraParcela,
  calcular13SegundaParcela,
  calcular13Integral,
} from './decimoTerceiro'