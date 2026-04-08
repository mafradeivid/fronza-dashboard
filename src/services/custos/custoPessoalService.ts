// ============================================
// CUSTO PESSOAL SERVICE
// Orquestra busca e cálculo de custos
// ============================================

import { Funcionario } from '@/types/pessoas'
import { listarFuncionarios } from '@/services/pessoas'
import { listarPagamentosExtras } from '@/services/pagamentosExtrasService'

// Types existentes (mantém compatibilidade)
import {
  DadosCustoPessoal,
  FiltrosCustoPessoal,
  CustoMensal,
  CustoPorEmpresa,
  CustoPorSetor,
  CustoPorFuncionario,
  ResumoCusto,
  gerarCompetencias,
  getNomeMes,
} from '@/types/custoPessoal'

// Types internos
import { Competencia } from './types'

// Funções internas
import { calcularEncargosFuncionario } from './calculoEncargos'
import {
  criarResumoVazio,
  encargosParaResumo,
  somarResumos,
  calcularTotais,
  calcularVariacao,
  ordenarPorCusto,
  calcularPercentual,
} from './agregacaoCustos'

/**
 * Calcula custos de pessoal com proporcionalidade
 */
export async function calcularCustoPessoal(
  filtros: FiltrosCustoPessoal
): Promise<DadosCustoPessoal> {
  // 1. Buscar dados
  const funcionarios = await buscarFuncionariosFiltrados(filtros)
  const competencias = gerarCompetencias(
    filtros.mesInicio,
    filtros.anoInicio,
    filtros.mesFim,
    filtros.anoFim
  )
  const pagamentosMap = await buscarPagamentosExtras(competencias, filtros)

  // 2. Calcular custos mensais
  const custosMensais = calcularCustosMensais(funcionarios, competencias, pagamentosMap)

  // 3. Calcular custos por empresa
  const custosPorEmpresa = calcularCustosPorEmpresa(funcionarios, competencias, pagamentosMap)

  // 4. Calcular custos por setor
  const custosPorSetor = calcularCustosPorSetor(funcionarios, competencias, pagamentosMap)

  // 5. Calcular custos por funcionário
  const custosPorFuncionario = calcularCustosPorFuncionario(funcionarios, competencias, pagamentosMap)

  // 6. Resumo geral
  let resumoGeral = criarResumoVazio()
  custosMensais.forEach(mes => {
    resumoGeral = somarResumos(resumoGeral, mes)
  })

  // 7. Label do período
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

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

/**
 * Busca funcionários aplicando filtros
 */
async function buscarFuncionariosFiltrados(
  filtros: FiltrosCustoPessoal
): Promise<Funcionario[]> {
  let funcionarios = await listarFuncionarios()

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

  return funcionarios
}

/**
 * Busca pagamentos extras e cria mapa
 */
async function buscarPagamentosExtras(
  competencias: Competencia[],
  filtros: FiltrosCustoPessoal
): Promise<Map<string, number>> {
  const pagamentosMap = new Map<string, number>()

  const promises = competencias.map(comp =>
    listarPagamentosExtras({
      competencia_mes: comp.mes,
      competencia_ano: comp.ano,
      empresa_id: filtros.empresaId || undefined,
    })
  )

  const resultados = await Promise.all(promises)

  competencias.forEach((comp, index) => {
    const pagamentos = resultados[index]
    pagamentos.forEach(p => {
      // Aplicar filtros
      if (filtros.funcionarioId && p.funcionario_id !== filtros.funcionarioId) return
      if (filtros.setorId && p.funcionario?.setor_id !== filtros.setorId) return
      if (filtros.cargoId && p.funcionario?.cargo_id !== filtros.cargoId) return

      const key = `${p.funcionario_id}-${comp.mes}-${comp.ano}`
      const atual = pagamentosMap.get(key) || 0
      pagamentosMap.set(key, atual + Number(p.valor))
    })
  })

  return pagamentosMap
}

/**
 * Calcula custos mensais (para gráfico de evolução)
 */
function calcularCustosMensais(
  funcionarios: Funcionario[],
  competencias: Competencia[],
  pagamentosMap: Map<string, number>
): CustoMensal[] {
  const custos: CustoMensal[] = []
  let custoAnterior: number | null = null

  competencias.forEach(comp => {
    let resumoMes = criarResumoVazio()

    funcionarios.forEach(func => {
      const encargos = calcularEncargosFuncionario(func, comp)
      
      // Só soma se estiver ativo na competência
      if (encargos.proporcionalidade.ativo) {
        const resumoFunc = encargosParaResumo(encargos)
        const keyPagExtra = `${func.id}-${comp.mes}-${comp.ano}`
        resumoFunc.pagamentosExtras = pagamentosMap.get(keyPagExtra) || 0
        resumoMes = somarResumos(resumoMes, resumoFunc)
      }
    })

    const resumoCompleto = calcularTotais(resumoMes)
    const variacao = calcularVariacao(resumoCompleto.custoTotal, custoAnterior)
    custoAnterior = resumoCompleto.custoTotal

    custos.push({
      ...resumoCompleto,
      competenciaMes: comp.mes,
      competenciaAno: comp.ano,
      competenciaLabel: comp.label,
      variacaoPercentual: variacao,
    })
  })

  return custos
}

/**
 * Calcula custos agrupados por empresa
 */
function calcularCustosPorEmpresa(
  funcionarios: Funcionario[],
  competencias: Competencia[],
  pagamentosMap: Map<string, number>
): CustoPorEmpresa[] {
  const mapa = new Map<number, { resumo: ResumoCusto; nome: string; qtd: number }>()

  funcionarios.forEach(func => {
    const empresaId = func.empresa_id || 0
    const empresaNome = func.empresa?.razao_social || 'Sem Empresa'

    if (!mapa.has(empresaId)) {
      mapa.set(empresaId, { resumo: criarResumoVazio(), nome: empresaNome, qtd: 0 })
    }

    const dados = mapa.get(empresaId)!
    let contou = false

    competencias.forEach(comp => {
      const encargos = calcularEncargosFuncionario(func, comp)
      
      if (encargos.proporcionalidade.ativo) {
        const resumoFunc = encargosParaResumo(encargos)
        const key = `${func.id}-${comp.mes}-${comp.ano}`
        resumoFunc.pagamentosExtras = pagamentosMap.get(key) || 0
        dados.resumo = somarResumos(dados.resumo, resumoFunc)
        contou = true
      }
    })

    if (contou) dados.qtd++
  })

  // Calcular total geral para percentuais
  let totalGeral = 0
  mapa.forEach(dados => {
    totalGeral += calcularTotais(dados.resumo).custoTotal
  })

  // Converter para array
  const resultado: CustoPorEmpresa[] = Array.from(mapa.entries()).map(([id, dados]) => {
    const completo = calcularTotais(dados.resumo)
    return {
      ...completo,
      empresaId: id,
      empresaNome: dados.nome,
      quantidadeFuncionarios: dados.qtd,
      percentualTotal: calcularPercentual(completo.custoTotal, totalGeral),
    }
  })

  return ordenarPorCusto(resultado)
}

/**
 * Calcula custos agrupados por setor
 */
function calcularCustosPorSetor(
  funcionarios: Funcionario[],
  competencias: Competencia[],
  pagamentosMap: Map<string, number>
): CustoPorSetor[] {
  const mapa = new Map<string, { resumo: ResumoCusto; nome: string; qtd: number }>()

  funcionarios.forEach(func => {
    const setorId = func.setor_id || 'sem-setor'
    const setorNome = func.setor?.nome || 'Sem Setor'

    if (!mapa.has(setorId)) {
      mapa.set(setorId, { resumo: criarResumoVazio(), nome: setorNome, qtd: 0 })
    }

    const dados = mapa.get(setorId)!
    let contou = false

    competencias.forEach(comp => {
      const encargos = calcularEncargosFuncionario(func, comp)
      
      if (encargos.proporcionalidade.ativo) {
        const resumoFunc = encargosParaResumo(encargos)
        const key = `${func.id}-${comp.mes}-${comp.ano}`
        resumoFunc.pagamentosExtras = pagamentosMap.get(key) || 0
        dados.resumo = somarResumos(dados.resumo, resumoFunc)
        contou = true
      }
    })

    if (contou) dados.qtd++
  })

  let totalGeral = 0
  mapa.forEach(dados => {
    totalGeral += calcularTotais(dados.resumo).custoTotal
  })

  const resultado: CustoPorSetor[] = Array.from(mapa.entries()).map(([id, dados]) => {
    const completo = calcularTotais(dados.resumo)
    return {
      ...completo,
      setorId: id,
      setorNome: dados.nome,
      quantidadeFuncionarios: dados.qtd,
      percentualTotal: calcularPercentual(completo.custoTotal, totalGeral),
    }
  })

  return ordenarPorCusto(resultado)
}

/**
 * Calcula custos por funcionário
 */
function calcularCustosPorFuncionario(
  funcionarios: Funcionario[],
  competencias: Competencia[],
  pagamentosMap: Map<string, number>
): CustoPorFuncionario[] {
  const resultado: CustoPorFuncionario[] = []

  funcionarios.forEach(func => {
    const custosMensais: CustoMensal[] = []
    let resumoTotal = criarResumoVazio()
    let custoAnterior: number | null = null

    competencias.forEach(comp => {
      const encargos = calcularEncargosFuncionario(func, comp)
      const resumoFunc = encargosParaResumo(encargos)
      const key = `${func.id}-${comp.mes}-${comp.ano}`
      resumoFunc.pagamentosExtras = pagamentosMap.get(key) || 0

      const completo = calcularTotais(resumoFunc)
      const variacao = calcularVariacao(completo.custoTotal, custoAnterior)
      custoAnterior = completo.custoTotal

      custosMensais.push({
        ...completo,
        competenciaMes: comp.mes,
        competenciaAno: comp.ano,
        competenciaLabel: comp.label,
        variacaoPercentual: variacao,
      })

      if (encargos.proporcionalidade.ativo) {
        resumoTotal = somarResumos(resumoTotal, resumoFunc)
      }
    })

    const totalCompleto = calcularTotais(resumoTotal)

    resultado.push({
      ...totalCompleto,
      funcionarioId: func.id!,
      funcionarioNome: func.nome_completo,
      empresaId: func.empresa_id || 0,
      empresaNome: func.empresa?.razao_social || 'Sem Empresa',
      setorNome: func.setor?.nome || null,
      cargoNome: func.cargo?.nome || null,
      salarioBase: Number(func.salario) || 0,
      custosMensais,
    })
  })

  return ordenarPorCusto(resultado)
}

/**
 * Exportar para Excel (placeholder)
 */
export function exportarCustoPessoalExcel(dados: DadosCustoPessoal): void {
  console.log('Exportar:', dados)
}