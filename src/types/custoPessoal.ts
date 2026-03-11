// Tipos para a página de Custo de Pessoal

export type VisualizacaoCusto = 'consolidado' | 'mensal' | 'empresa' | 'setor' | 'funcionario'

// Filtros disponíveis
export interface FiltrosCustoPessoal {
  mesInicio: number
  anoInicio: number
  mesFim: number
  anoFim: number
  empresaId: number | null
  setorId: string | null
  cargoId: number | null
  funcionarioId: number | null
}

// Filtros iniciais (mês atual)
export const FILTROS_CUSTO_INICIAL: FiltrosCustoPessoal = {
  mesInicio: new Date().getMonth() + 1,
  anoInicio: new Date().getFullYear(),
  mesFim: new Date().getMonth() + 1,
  anoFim: new Date().getFullYear(),
  empresaId: null,
  setorId: null,
  cargoId: null,
  funcionarioId: null,
}

// Resumo de custos (base para todas as visões)
export interface ResumoCusto {
  salarios: number
  outrosProventos: number
  fgts: number
  inssPatronal: number
  provisao13: number
  provisaoFerias: number
  provisao13Ferias: number
  provisaoRescisao: number
  pagamentosExtras: number
}

// Resumo com totais calculados
export interface ResumoCustoCompleto extends ResumoCusto {
  totalEncargos: number       // FGTS + INSS
  totalProvisoes: number      // 13º + Férias + 1/3 + Rescisão
  custoTotal: number          // Tudo somado
}

// Custo por mês
export interface CustoMensal extends ResumoCustoCompleto {
  competenciaMes: number
  competenciaAno: number
  competenciaLabel: string    // "Jan/2026"
  variacaoPercentual: number | null
}

// Custo por empresa
export interface CustoPorEmpresa extends ResumoCustoCompleto {
  empresaId: number
  empresaNome: string
  quantidadeFuncionarios: number
  percentualTotal: number
}

export interface CustoPorSetor extends ResumoCustoCompleto {
  setorId: string
  setorNome: string
  quantidadeFuncionarios: number
  percentualTotal: number
}

// Custo por funcionário (com histórico mensal)
export interface CustoPorFuncionario extends ResumoCustoCompleto {
  funcionarioId: number
  funcionarioNome: string
  empresaId: number
  empresaNome: string
  setorNome: string | null
  cargoNome: string | null
  salarioBase: number
  custosMensais: CustoMensal[]
}

// Dados consolidados para a página
export interface DadosCustoPessoal {
  resumoGeral: ResumoCustoCompleto
  custosMensais: CustoMensal[]
  custosPorEmpresa: CustoPorEmpresa[]
  custosPorSetor: CustoPorSetor[]   
  custosPorFuncionario: CustoPorFuncionario[]
  periodoLabel: string        // "Janeiro/2026 a Março/2026"
}

// Labels para exibição
export const LABELS_CUSTO: Record<keyof ResumoCusto, string> = {
  salarios: 'Salários',
  outrosProventos: 'Outros Proventos',
  fgts: 'FGTS',
  inssPatronal: 'INSS Patronal',
  provisao13: 'Provisão 13º',
  provisaoFerias: 'Provisão Férias',
  provisao13Ferias: 'Provisão 1/3 Férias',
  provisaoRescisao: 'Provisão Rescisão',
  pagamentosExtras: 'Pagamentos Extras',
}

// Cores para gráficos
export const CORES_CUSTO: Record<string, string> = {
  salarios: '#3b82f6',          // blue-500
  outrosProventos: '#8b5cf6',   // violet-500
  fgts: '#f59e0b',              // amber-500
  inssPatronal: '#ef4444',      // red-500
  provisao13: '#10b981',        // emerald-500
  provisaoFerias: '#06b6d4',    // cyan-500
  provisao13Ferias: '#14b8a6',  // teal-500
  provisaoRescisao: '#f97316',  // orange-500
  pagamentosExtras: '#ec4899',  // pink-500
}

// Helper para obter nome do mês
export function getNomeMes(mes: number): string {
  const meses = [
    '', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]
  return meses[mes] || ''
}

// Helper para obter nome do mês abreviado
export function getNomeMesAbrev(mes: number): string {
  const meses = [
    '', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
  ]
  return meses[mes] || ''
}

// Helper para gerar label de competência
export function getCompetenciaLabel(mes: number, ano: number): string {
  return `${getNomeMesAbrev(mes)}/${ano}`
}

// Helper para gerar lista de competências entre duas datas
export function gerarCompetencias(
  mesInicio: number,
  anoInicio: number,
  mesFim: number,
  anoFim: number
): { mes: number; ano: number; label: string }[] {
  const competencias: { mes: number; ano: number; label: string }[] = []
  
  let mesAtual = mesInicio
  let anoAtual = anoInicio

  while (anoAtual < anoFim || (anoAtual === anoFim && mesAtual <= mesFim)) {
    competencias.push({
      mes: mesAtual,
      ano: anoAtual,
      label: getCompetenciaLabel(mesAtual, anoAtual),
    })

    mesAtual++
    if (mesAtual > 12) {
      mesAtual = 1
      anoAtual++
    }
  }

  return competencias
}