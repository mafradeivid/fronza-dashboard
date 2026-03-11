import { Funcionario } from '@/types/pessoas'
import {
  ResumoCusto,
  ResumoCustoCompleto,
  CustoMensal,
  CustoPorEmpresa,
  CustoPorSetor,
  CustoPorFuncionario,
  DadosCustoPessoal,
  FiltrosCustoPessoal,
  gerarCompetencias,
  getNomeMes,
} from '@/types/custoPessoal'
import { listarFuncionarios } from '@/services/pessoas'
import { listarPagamentosExtras } from '@/services/pagamentosExtrasService'

// Constantes de cálculo (mesmo padrão do encargosService)
const ALIQUOTA_FGTS = 0.08 // 8%

// Criar resumo vazio
function criarResumoVazio(): ResumoCusto {
  return {
    salarios: 0,
    outrosProventos: 0,
    fgts: 0,
    inssPatronal: 0,
    provisao13: 0,
    provisaoFerias: 0,
    provisao13Ferias: 0,
    provisaoRescisao: 0,
    pagamentosExtras: 0,
  }
}

// Calcular totais do resumo
function calcularTotais(resumo: ResumoCusto): ResumoCustoCompleto {
  const totalEncargos = resumo.fgts + resumo.inssPatronal
  const totalProvisoes = resumo.provisao13 + resumo.provisaoFerias + resumo.provisao13Ferias + resumo.provisaoRescisao
  const custoTotal = resumo.salarios + resumo.outrosProventos + totalEncargos + totalProvisoes + resumo.pagamentosExtras

  return {
    ...resumo,
    totalEncargos,
    totalProvisoes,
    custoTotal,
  }
}

// Calcular encargos de um funcionário (para 1 mês)
function calcularEncargosFuncionario(funcionario: Funcionario): ResumoCusto {
  const salario = Number(funcionario.salario) || 0
  const outrosProventos = Number(funcionario.outros_proventos) || 0
  const aliquotaINSS = (Number(funcionario.empresa?.aliquota_inss) || 0) / 100
  const aliquotaRescisao = (Number(funcionario.empresa?.aliquota_provisao_rescisao) || 0) / 100

  const fgts = salario * ALIQUOTA_FGTS
  const inssPatronal = salario * aliquotaINSS

  const decimoTerceiro = salario / 12
  const ferias = salario / 12
  const tercoFerias = ferias / 3
  const provisaoRescisao = salario * aliquotaRescisao

  const fgtsDecimoTerceiro = decimoTerceiro * ALIQUOTA_FGTS
  const inssDecimoTerceiro = decimoTerceiro * aliquotaINSS
  const fgtsFerias = ferias * ALIQUOTA_FGTS
  const inssFerias = ferias * aliquotaINSS
  const fgtsTercoFerias = tercoFerias * ALIQUOTA_FGTS
  const inssTercoFerias = tercoFerias * aliquotaINSS

  return {
    salarios: salario,
    outrosProventos,
    fgts,
    inssPatronal,
    provisao13: decimoTerceiro + fgtsDecimoTerceiro + inssDecimoTerceiro,
    provisaoFerias: ferias + fgtsFerias + inssFerias,
    provisao13Ferias: tercoFerias + fgtsTercoFerias + inssTercoFerias,
    provisaoRescisao,
    pagamentosExtras: 0,
  }
}

// Somar dois resumos
function somarResumos(a: ResumoCusto, b: ResumoCusto): ResumoCusto {
  return {
    salarios: a.salarios + b.salarios,
    outrosProventos: a.outrosProventos + b.outrosProventos,
    fgts: a.fgts + b.fgts,
    inssPatronal: a.inssPatronal + b.inssPatronal,
    provisao13: a.provisao13 + b.provisao13,
    provisaoFerias: a.provisaoFerias + b.provisaoFerias,
    provisao13Ferias: a.provisao13Ferias + b.provisao13Ferias,
    provisaoRescisao: a.provisaoRescisao + b.provisaoRescisao,
    pagamentosExtras: a.pagamentosExtras + b.pagamentosExtras,
  }
}

// Multiplicar resumo por quantidade de meses
function multiplicarResumo(resumo: ResumoCusto, meses: number): ResumoCusto {
  return {
    salarios: resumo.salarios * meses,
    outrosProventos: resumo.outrosProventos * meses,
    fgts: resumo.fgts * meses,
    inssPatronal: resumo.inssPatronal * meses,
    provisao13: resumo.provisao13 * meses,
    provisaoFerias: resumo.provisaoFerias * meses,
    provisao13Ferias: resumo.provisao13Ferias * meses,
    provisaoRescisao: resumo.provisaoRescisao * meses,
    pagamentosExtras: resumo.pagamentosExtras * meses,
  }
}

// Buscar dados e calcular custos
export async function calcularCustoPessoal(filtros: FiltrosCustoPessoal): Promise<DadosCustoPessoal> {
  // Buscar funcionários
  let funcionarios = await listarFuncionarios()

  // Aplicar filtros
  if (filtros.empresaId) {
    funcionarios = funcionarios.filter(f => f.empresa_id === filtros.empresaId)
  }
  if (filtros.setorId) {
    funcionarios = funcionarios.filter(f => f.setor_id === filtros.setorId)
  }
  if (filtros.cargoId) {
    funcionarios = funcionarios.filter(f => f.cargo_id === filtros.cargoId)
  }
  if (filtros.funcionarioId) {
    funcionarios = funcionarios.filter(f => f.id === filtros.funcionarioId)
  }

  // Gerar lista de competências
  const competencias = gerarCompetencias(
    filtros.mesInicio,
    filtros.anoInicio,
    filtros.mesFim,
    filtros.anoFim
  )

  // Buscar pagamentos extras do período
  const pagamentosExtrasPromises = competencias.map(comp =>
    listarPagamentosExtras({
      competencia_mes: comp.mes,
      competencia_ano: comp.ano,
      empresa_id: filtros.empresaId || undefined,
    })
  )
  const pagamentosExtrasPorMes = await Promise.all(pagamentosExtrasPromises)

  // Criar mapa de pagamentos extras por funcionário e competência
  const pagamentosMap = new Map<string, number>()
  competencias.forEach((comp, index) => {
    const pagamentos = pagamentosExtrasPorMes[index]
    pagamentos.forEach(p => {
      if (filtros.funcionarioId && p.funcionario_id !== filtros.funcionarioId) return
      if (filtros.setorId && p.funcionario?.setor_id !== filtros.setorId) return
      if (filtros.cargoId && p.funcionario?.cargo_id !== filtros.cargoId) return

      const key = `${p.funcionario_id}-${comp.mes}-${comp.ano}`
      const atual = pagamentosMap.get(key) || 0
      pagamentosMap.set(key, atual + Number(p.valor))
    })
  })

  // ===== CALCULAR CUSTOS MENSAIS =====
  const custosMensais: CustoMensal[] = []
  let custoAnterior: number | null = null

  competencias.forEach(comp => {
    let resumoMes = criarResumoVazio()

    funcionarios.forEach(func => {
      const encargos = calcularEncargosFuncionario(func)
      const keyPagExtra = `${func.id}-${comp.mes}-${comp.ano}`
      encargos.pagamentosExtras = pagamentosMap.get(keyPagExtra) || 0
      resumoMes = somarResumos(resumoMes, encargos)
    })

    const resumoCompleto = calcularTotais(resumoMes)
    
    let variacaoPercentual: number | null = null
    if (custoAnterior !== null && custoAnterior > 0) {
      variacaoPercentual = ((resumoCompleto.custoTotal - custoAnterior) / custoAnterior) * 100
    }
    custoAnterior = resumoCompleto.custoTotal

    custosMensais.push({
      ...resumoCompleto,
      competenciaMes: comp.mes,
      competenciaAno: comp.ano,
      competenciaLabel: comp.label,
      variacaoPercentual,
    })
  })

  // ===== CALCULAR CUSTOS POR EMPRESA =====
  const custosPorEmpresaMap = new Map<number, { resumo: ResumoCusto; nome: string; qtdFunc: number }>()

  funcionarios.forEach(func => {
    const empresaId = func.empresa_id || 0
    const empresaNome = func.empresa?.razao_social || 'Sem Empresa'

    if (!custosPorEmpresaMap.has(empresaId)) {
      custosPorEmpresaMap.set(empresaId, {
        resumo: criarResumoVazio(),
        nome: empresaNome,
        qtdFunc: 0,
      })
    }

    const dados = custosPorEmpresaMap.get(empresaId)!
    const encargos = calcularEncargosFuncionario(func)
    const encargosMultiplicados = multiplicarResumo(encargos, competencias.length)

    let totalPagExtras = 0
    competencias.forEach(comp => {
      const key = `${func.id}-${comp.mes}-${comp.ano}`
      totalPagExtras += pagamentosMap.get(key) || 0
    })
    encargosMultiplicados.pagamentosExtras = totalPagExtras

    dados.resumo = somarResumos(dados.resumo, encargosMultiplicados)
    dados.qtdFunc++
  })

  let totalGeral = 0
  custosPorEmpresaMap.forEach(dados => {
    totalGeral += calcularTotais(dados.resumo).custoTotal
  })

  const custosPorEmpresa: CustoPorEmpresa[] = Array.from(custosPorEmpresaMap.entries()).map(([empresaId, dados]) => {
    const resumoCompleto = calcularTotais(dados.resumo)
    return {
      ...resumoCompleto,
      empresaId,
      empresaNome: dados.nome,
      quantidadeFuncionarios: dados.qtdFunc,
      percentualTotal: totalGeral > 0 ? (resumoCompleto.custoTotal / totalGeral) * 100 : 0,
    }
  }).sort((a, b) => b.custoTotal - a.custoTotal)

  // ===== CALCULAR CUSTOS POR SETOR =====
  const custosPorSetorMap = new Map<string, { resumo: ResumoCusto; nome: string; qtdFunc: number }>()

  funcionarios.forEach(func => {
    const setorId = func.setor_id || 'sem-setor'
    const setorNome = func.setor?.nome || 'Sem Setor'

    if (!custosPorSetorMap.has(setorId)) {
      custosPorSetorMap.set(setorId, {
        resumo: criarResumoVazio(),
        nome: setorNome,
        qtdFunc: 0,
      })
    }

    const dados = custosPorSetorMap.get(setorId)!
    const encargos = calcularEncargosFuncionario(func)
    const encargosMultiplicados = multiplicarResumo(encargos, competencias.length)

    let totalPagExtras = 0
    competencias.forEach(comp => {
      const key = `${func.id}-${comp.mes}-${comp.ano}`
      totalPagExtras += pagamentosMap.get(key) || 0
    })
    encargosMultiplicados.pagamentosExtras = totalPagExtras

    dados.resumo = somarResumos(dados.resumo, encargosMultiplicados)
    dados.qtdFunc++
  })

  const custosPorSetor: CustoPorSetor[] = Array.from(custosPorSetorMap.entries()).map(([setorId, dados]) => {
    const resumoCompleto = calcularTotais(dados.resumo)
    return {
      ...resumoCompleto,
      setorId,
      setorNome: dados.nome,
      quantidadeFuncionarios: dados.qtdFunc,
      percentualTotal: totalGeral > 0 ? (resumoCompleto.custoTotal / totalGeral) * 100 : 0,
    }
  }).sort((a, b) => b.custoTotal - a.custoTotal)

  // ===== CALCULAR CUSTOS POR FUNCIONÁRIO =====
  const custosPorFuncionario: CustoPorFuncionario[] = funcionarios.map(func => {
    const encargosBase = calcularEncargosFuncionario(func)
    
    const custosMensaisFunc: CustoMensal[] = []
    let custoAntFunc: number | null = null

    competencias.forEach(comp => {
      const keyPagExtra = `${func.id}-${comp.mes}-${comp.ano}`
      const encargos = { ...encargosBase }
      encargos.pagamentosExtras = pagamentosMap.get(keyPagExtra) || 0

      const resumoCompleto = calcularTotais(encargos)

      let variacao: number | null = null
      if (custoAntFunc !== null && custoAntFunc > 0) {
        variacao = ((resumoCompleto.custoTotal - custoAntFunc) / custoAntFunc) * 100
      }
      custoAntFunc = resumoCompleto.custoTotal

      custosMensaisFunc.push({
        ...resumoCompleto,
        competenciaMes: comp.mes,
        competenciaAno: comp.ano,
        competenciaLabel: comp.label,
        variacaoPercentual: variacao,
      })
    })

    const encargosTotal = multiplicarResumo(encargosBase, competencias.length)
    let totalPagExtras = 0
    competencias.forEach(comp => {
      const key = `${func.id}-${comp.mes}-${comp.ano}`
      totalPagExtras += pagamentosMap.get(key) || 0
    })
    encargosTotal.pagamentosExtras = totalPagExtras

    const resumoTotal = calcularTotais(encargosTotal)

    return {
      ...resumoTotal,
      funcionarioId: func.id!,
      funcionarioNome: func.nome_completo,
      empresaId: func.empresa_id || 0,
      empresaNome: func.empresa?.razao_social || 'Sem Empresa',
      setorNome: func.setor?.nome || null,
      cargoNome: func.cargo?.nome || null,
      salarioBase: Number(func.salario) || 0,
      custosMensais: custosMensaisFunc,
    }
  }).sort((a, b) => b.custoTotal - a.custoTotal)

  // ===== RESUMO GERAL =====
  let resumoGeral = criarResumoVazio()
  custosMensais.forEach(mes => {
    resumoGeral = somarResumos(resumoGeral, mes)
  })

  const periodoLabel = competencias.length === 1
    ? `${getNomeMes(filtros.mesInicio)}/${filtros.anoInicio}`
    : `${getNomeMes(filtros.mesInicio)}/${filtros.anoInicio} a ${getNomeMes(filtros.mesFim)}/${filtros.anoFim}`

  return {
    resumoGeral: calcularTotais(resumoGeral),
    custosMensais,
    custosPorEmpresa,
    custosPorSetor,
    custosPorFuncionario,
    periodoLabel,
  }
}

export function exportarCustoPessoalExcel(dados: DadosCustoPessoal): void {
  console.log('Exportar:', dados)
}