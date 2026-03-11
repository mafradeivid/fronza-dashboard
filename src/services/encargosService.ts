import { Funcionario, Empresa } from '@/types/pessoas'

// ============================================
// TIPOS
// ============================================

export interface EncargosCalculados {
  // Encargos mensais
  fgts: number
  inssPatronal: number
  totalEncargos: number
  
  // Provisões
  decimoTerceiro: number
  ferias: number
  tercoFerias: number
  feriasComTerco: number
  provisaoRescisao: number
  
  // Encargos sobre provisões
  fgtsDecimoTerceiro: number
  inssDecimoTerceiro: number
  fgtsFerias: number
  inssFerias: number
  totalEncargosProvisoes: number
  
  // Totais
  totalProvisoes: number
  custoMensalTotal: number
}

export interface FuncionarioComEncargos extends Funcionario {
  encargos: EncargosCalculados
}

export interface ResumoEmpresa {
  empresa: Empresa
  totalFuncionarios: number
  totalSalarios: number
  totalOutrosProventos: number
  totalFgts: number
  totalInss: number
  totalEncargos: number
  totalDecimoTerceiro: number
  totalFerias: number
  totalProvisaoRescisao: number
  totalEncargosProvisoes: number
  totalProvisoes: number
  custoMensalTotal: number
}

// ============================================
// CONSTANTES
// ============================================

export const ALIQUOTA_FGTS = 0.08 // 8%

// ============================================
// FUNÇÕES DE CÁLCULO
// ============================================

/**
 * Calcula todos os encargos e provisões de um funcionário
 */
export function calcularEncargos(
  funcionario: Funcionario,
  aliquotaInss: number,
  aliquotaRescisao: number
): EncargosCalculados {
  const salario = Number(funcionario.salario) || 0
  const aliquotaInssDecimal = aliquotaInss / 100
  const aliquotaRescisaoDecimal = aliquotaRescisao / 100

  // === ENCARGOS MENSAIS ===
  // FGTS: 8% sobre salário (outros proventos não incide)
  const fgts = salario * ALIQUOTA_FGTS
  
  // INSS Patronal: alíquota definida pela empresa sobre salário
  const inssPatronal = salario * aliquotaInssDecimal
  
  const totalEncargos = fgts + inssPatronal

  // === PROVISÕES ===
  // 13º Salário: 1/12 do salário
  const decimoTerceiro = salario / 12
  
  // Férias: 1/12 do salário
  const ferias = salario / 12
  
  // 1/3 de Férias: 1/3 das férias
  const tercoFerias = ferias / 3
  
  // Férias com 1/3
  const feriasComTerco = ferias + tercoFerias
  
  // Provisão Rescisão: alíquota sobre salário (sem encargos)
  const provisaoRescisao = salario * aliquotaRescisaoDecimal

  // === ENCARGOS SOBRE PROVISÕES ===
  // Encargos sobre 13º
  const fgtsDecimoTerceiro = decimoTerceiro * ALIQUOTA_FGTS
  const inssDecimoTerceiro = decimoTerceiro * aliquotaInssDecimal
  
  // Encargos sobre Férias + 1/3 (ambos incidem FGTS e INSS)
  const fgtsFerias = feriasComTerco * ALIQUOTA_FGTS
  const inssFerias = feriasComTerco * aliquotaInssDecimal
  
  const totalEncargosProvisoes = fgtsDecimoTerceiro + inssDecimoTerceiro + fgtsFerias + inssFerias

  // === TOTAIS ===
  const totalProvisoes = decimoTerceiro + feriasComTerco + provisaoRescisao + totalEncargosProvisoes
  
  // Custo mensal total = Salário + Outros Proventos + Encargos + Provisões
  const outrosProventos = Number(funcionario.outros_proventos) || 0
  const custoMensalTotal = salario + outrosProventos + totalEncargos + totalProvisoes

  return {
    fgts,
    inssPatronal,
    totalEncargos,
    decimoTerceiro,
    ferias,
    tercoFerias,
    feriasComTerco,
    provisaoRescisao,
    fgtsDecimoTerceiro,
    inssDecimoTerceiro,
    fgtsFerias,
    inssFerias,
    totalEncargosProvisoes,
    totalProvisoes,
    custoMensalTotal,
  }
}

/**
 * Calcula encargos para todos os funcionários
 */
export function calcularEncargosLista(
  funcionarios: Funcionario[],
  empresas: Empresa[]
): FuncionarioComEncargos[] {
  return funcionarios.map(func => {
    const empresa = empresas.find(e => e.id === func.empresa_id)
    const aliquotaInss = empresa?.aliquota_inss || 0
    const aliquotaRescisao = empresa?.aliquota_provisao_rescisao || 0
    
    return {
      ...func,
      encargos: calcularEncargos(func, aliquotaInss, aliquotaRescisao),
    }
  })
}

/**
 * Gera resumo consolidado por empresa
 */
export function gerarResumoEmpresas(
  funcionariosComEncargos: FuncionarioComEncargos[],
  empresas: Empresa[]
): ResumoEmpresa[] {
  return empresas.map(empresa => {
    const funcionariosEmpresa = funcionariosComEncargos.filter(f => f.empresa_id === empresa.id)
    
    const totalSalarios = funcionariosEmpresa.reduce((acc, f) => acc + Number(f.salario), 0)
    const totalOutrosProventos = funcionariosEmpresa.reduce((acc, f) => acc + Number(f.outros_proventos || 0), 0)
    const totalFgts = funcionariosEmpresa.reduce((acc, f) => acc + f.encargos.fgts, 0)
    const totalInss = funcionariosEmpresa.reduce((acc, f) => acc + f.encargos.inssPatronal, 0)
    const totalEncargos = funcionariosEmpresa.reduce((acc, f) => acc + f.encargos.totalEncargos, 0)
    const totalDecimoTerceiro = funcionariosEmpresa.reduce((acc, f) => acc + f.encargos.decimoTerceiro, 0)
    const totalFerias = funcionariosEmpresa.reduce((acc, f) => acc + f.encargos.feriasComTerco, 0)
    const totalProvisaoRescisao = funcionariosEmpresa.reduce((acc, f) => acc + f.encargos.provisaoRescisao, 0)
    const totalEncargosProvisoes = funcionariosEmpresa.reduce((acc, f) => acc + f.encargos.totalEncargosProvisoes, 0)
    const totalProvisoes = funcionariosEmpresa.reduce((acc, f) => acc + f.encargos.totalProvisoes, 0)
    const custoMensalTotal = funcionariosEmpresa.reduce((acc, f) => acc + f.encargos.custoMensalTotal, 0)
    
    return {
      empresa,
      totalFuncionarios: funcionariosEmpresa.length,
      totalSalarios,
      totalOutrosProventos,
      totalFgts,
      totalInss,
      totalEncargos,
      totalDecimoTerceiro,
      totalFerias,
      totalProvisaoRescisao,
      totalEncargosProvisoes,
      totalProvisoes,
      custoMensalTotal,
    }
  }).filter(r => r.totalFuncionarios > 0)
}

/**
 * Gera resumo geral (todas as empresas)
 */
export function gerarResumoGeral(resumoEmpresas: ResumoEmpresa[]): Omit<ResumoEmpresa, 'empresa'> & { empresa: null } {
  return {
    empresa: null,
    totalFuncionarios: resumoEmpresas.reduce((acc, r) => acc + r.totalFuncionarios, 0),
    totalSalarios: resumoEmpresas.reduce((acc, r) => acc + r.totalSalarios, 0),
    totalOutrosProventos: resumoEmpresas.reduce((acc, r) => acc + r.totalOutrosProventos, 0),
    totalFgts: resumoEmpresas.reduce((acc, r) => acc + r.totalFgts, 0),
    totalInss: resumoEmpresas.reduce((acc, r) => acc + r.totalInss, 0),
    totalEncargos: resumoEmpresas.reduce((acc, r) => acc + r.totalEncargos, 0),
    totalDecimoTerceiro: resumoEmpresas.reduce((acc, r) => acc + r.totalDecimoTerceiro, 0),
    totalFerias: resumoEmpresas.reduce((acc, r) => acc + r.totalFerias, 0),
    totalProvisaoRescisao: resumoEmpresas.reduce((acc, r) => acc + r.totalProvisaoRescisao, 0),
    totalEncargosProvisoes: resumoEmpresas.reduce((acc, r) => acc + r.totalEncargosProvisoes, 0),
    totalProvisoes: resumoEmpresas.reduce((acc, r) => acc + r.totalProvisoes, 0),
    custoMensalTotal: resumoEmpresas.reduce((acc, r) => acc + r.custoMensalTotal, 0),
  }
}