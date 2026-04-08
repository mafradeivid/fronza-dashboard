import { useState, useMemo } from 'react'
import { useFuncionarios } from './useFuncionarios'
import { Funcionario, calcularDatasExperiencia } from '@/types/pessoas'
import { 
  diasAteAniversario, 
  getDiaMes, 
  estaProximosDias, 
  calcularTempoEmpresaAnos 
} from '@/utils/aniversarios'

export type FiltroAniversario = 'mes' | 'proximos30'

export interface AniversarianteNascimento extends Funcionario {
  diasAte: number
}

export interface AniversarianteEmpresa extends Funcionario {
  diasAte: number
  anosEmpresa: number
}

export interface EmpresaResumo {
  nome: string
  quantidade: number
}

export interface DadosTurnover {
  admissoes: number
  demissoes: number
  mediaFuncionarios: number
  taxaTurnover: number
}

export interface FuncionarioExperiencia {
  funcionario: Funcionario
  tipo: '1º período' | '2º período'
  diasRestantes: number
  dataFim: Date
}

export function useVisaoGeralRH() {
  const { todosOsFuncionarios, empresas, carregando } = useFuncionarios()
  
  // Filtros de aniversário de nascimento
  const [filtroAnivNasc, setFiltroAnivNasc] = useState<FiltroAniversario>('proximos30')
  const [mesAnivNasc, setMesAnivNasc] = useState(new Date().getMonth() + 1)
  
  // Filtros de aniversário de empresa
  const [filtroAnivEmp, setFiltroAnivEmp] = useState<FiltroAniversario>('proximos30')
  const [mesAnivEmp, setMesAnivEmp] = useState(new Date().getMonth() + 1)
  
  // Filtros de turnover (null = ano inteiro)
  const [turnoverEmpresa, setTurnoverEmpresa] = useState<number | null>(null)
  const [turnoverMes, setTurnoverMes] = useState<number | null>(null) // null = ano todo
  const [turnoverAno, setTurnoverAno] = useState(new Date().getFullYear())

  // ============================================
  // FUNCIONÁRIOS POR EMPRESA
  // ============================================
  const funcionariosPorEmpresa = useMemo<EmpresaResumo[]>(() => {
    const map = new Map<number, { nome: string; quantidade: number }>()
    
    todosOsFuncionarios.forEach((func: Funcionario) => {
      const empresaId = func.empresa_id || 0
      const empresaNome = func.empresa?.razao_social || 'Sem Empresa'
      
      if (!map.has(empresaId)) {
        map.set(empresaId, { nome: empresaNome, quantidade: 0 })
      }
      map.get(empresaId)!.quantidade++
    })
    
    return Array.from(map.values()).sort((a, b) => b.quantidade - a.quantidade)
  }, [todosOsFuncionarios])

  // ============================================
  // ANIVERSARIANTES DE NASCIMENTO
  // ============================================
  const aniversariantesNascimento = useMemo<AniversarianteNascimento[]>(() => {
    const lista: AniversarianteNascimento[] = []
    
    todosOsFuncionarios.forEach((func: Funcionario) => {
      if (!func.nascimento || func.status !== 'ativo') return
      
      const { mes } = getDiaMes(func.nascimento)
      const diasAte = diasAteAniversario(func.nascimento)
      
      if (filtroAnivNasc === 'proximos30') {
        if (estaProximosDias(func.nascimento, 30)) {
          lista.push({ ...func, diasAte })
        }
      } else {
        if (mes === mesAnivNasc) {
          lista.push({ ...func, diasAte })
        }
      }
    })
    
    return lista.sort((a, b) => a.diasAte - b.diasAte)
  }, [todosOsFuncionarios, filtroAnivNasc, mesAnivNasc])

  // ============================================
  // ANIVERSARIANTES DE EMPRESA
  // ============================================
  const aniversariantesEmpresa = useMemo<AniversarianteEmpresa[]>(() => {
    const lista: AniversarianteEmpresa[] = []
    
    todosOsFuncionarios.forEach((func: Funcionario) => {
      if (!func.admissao || func.status !== 'ativo') return
      
      const { mes } = getDiaMes(func.admissao)
      const diasAte = diasAteAniversario(func.admissao)
      const anosEmpresa = calcularTempoEmpresaAnos(func.admissao)
      
      // Só mostrar quem completa pelo menos 1 ano
      if (anosEmpresa < 1 && diasAte > 0) return
      
      if (filtroAnivEmp === 'proximos30') {
        if (estaProximosDias(func.admissao, 30)) {
          lista.push({ ...func, diasAte, anosEmpresa: anosEmpresa + (diasAte > 0 ? 1 : 0) })
        }
      } else {
        if (mes === mesAnivEmp) {
          lista.push({ ...func, diasAte, anosEmpresa: anosEmpresa + (diasAte > 0 ? 1 : 0) })
        }
      }
    })
    
    return lista.sort((a, b) => a.diasAte - b.diasAte)
  }, [todosOsFuncionarios, filtroAnivEmp, mesAnivEmp])

  // ============================================
  // TURNOVER (MENSAL OU ANUAL)
  // ============================================
  const dadosTurnover = useMemo<DadosTurnover>(() => {
    // Filtrar por empresa se selecionada
    let funcionariosFiltrados = todosOsFuncionarios
    if (turnoverEmpresa) {
      funcionariosFiltrados = todosOsFuncionarios.filter(f => f.empresa_id === turnoverEmpresa)
    }
    
    // Definir período
    let primeiroDia: Date
    let ultimoDia: Date
    
    if (turnoverMes === null) {
      // Ano inteiro
      primeiroDia = new Date(turnoverAno, 0, 1) // 1º de janeiro
      ultimoDia = new Date(turnoverAno, 11, 31) // 31 de dezembro
    } else {
      // Mês específico
      primeiroDia = new Date(turnoverAno, turnoverMes - 1, 1)
      ultimoDia = new Date(turnoverAno, turnoverMes, 0) // Último dia do mês
    }
    
    // Contar admissões no período
    const admissoes = funcionariosFiltrados.filter(f => {
      if (!f.admissao) return false
      const dataAdmissao = new Date(f.admissao)
      return dataAdmissao >= primeiroDia && dataAdmissao <= ultimoDia
    }).length
    
    // Contar demissões no período
    const demissoes = funcionariosFiltrados.filter(f => {
      if (!f.data_ultimo_dia) return false
      const dataUltimoDia = new Date(f.data_ultimo_dia)
      return dataUltimoDia >= primeiroDia && dataUltimoDia <= ultimoDia
    }).length
    
    // Funcionários ativos no início do período
    const ativosInicio = funcionariosFiltrados.filter(f => {
      const dataAdmissao = new Date(f.admissao)
      const estaAdmitido = dataAdmissao < primeiroDia
      const naoSaiu = !f.data_ultimo_dia || new Date(f.data_ultimo_dia) >= primeiroDia
      return estaAdmitido && naoSaiu
    }).length
    
    // Funcionários ativos no fim do período
    const ativosFim = funcionariosFiltrados.filter(f => {
      const dataAdmissao = new Date(f.admissao)
      const estaAdmitido = dataAdmissao <= ultimoDia
      const naoSaiu = !f.data_ultimo_dia || new Date(f.data_ultimo_dia) > ultimoDia
      return estaAdmitido && naoSaiu
    }).length
    
    // Média de funcionários
    const mediaFuncionarios = Math.round((ativosInicio + ativosFim) / 2)
    
    // Taxa de turnover
    const taxaTurnover = mediaFuncionarios > 0 
      ? (demissoes / mediaFuncionarios) * 100 
      : 0
    
    return {
      admissoes,
      demissoes,
      mediaFuncionarios,
      taxaTurnover,
    }
  }, [todosOsFuncionarios, turnoverEmpresa, turnoverMes, turnoverAno])

  // ============================================
  // EXPERIÊNCIAS VENCENDO
  // ============================================
  const experienciasVencendo = useMemo<FuncionarioExperiencia[]>(() => {
    const resultado: FuncionarioExperiencia[] = []
    
    todosOsFuncionarios.forEach(func => {
      if (func.status !== 'ativo') return
      if (!func.periodo_experiencia) return
      
      const datas = calcularDatasExperiencia(func.admissao, func.periodo_experiencia)
      if (!datas || datas.periodoAtual === 'encerrado') return
      
      // Verifica 1º período (próximos 30 dias)
      if (datas.periodoAtual === 1 && datas.diasRestantesPrimeiro <= 30) {
        resultado.push({
          funcionario: func,
          tipo: '1º período',
          diasRestantes: datas.diasRestantesPrimeiro,
          dataFim: datas.fimPrimeiroPeriodo,
        })
      }
      // Verifica 2º período (próximos 30 dias)
      else if (datas.periodoAtual === 2 && datas.diasRestantesSegundo <= 30) {
        resultado.push({
          funcionario: func,
          tipo: '2º período',
          diasRestantes: datas.diasRestantesSegundo,
          dataFim: datas.fimSegundoPeriodo,
        })
      }
    })
    
    // Ordenar por dias restantes
    return resultado.sort((a, b) => a.diasRestantes - b.diasRestantes)
  }, [todosOsFuncionarios])

  // ============================================
  // FUNCIONÁRIOS AFASTADOS
  // ============================================
  const funcionariosAfastados = useMemo<Funcionario[]>(() => {
    return todosOsFuncionarios
      .filter(f => f.status === 'afastado')
      .sort((a, b) => a.nome_completo.localeCompare(b.nome_completo))
  }, [todosOsFuncionarios])

  // ============================================
  // CONTADORES PARA CARDS
  // ============================================
  const totalFuncionarios = todosOsFuncionarios.filter(f => f.status === 'ativo').length
  const totalEmpresas = empresas.length
  
  const totalAniversariosProximos = useMemo(() => {
    return todosOsFuncionarios.filter(
      (f: Funcionario) => f.nascimento && f.status === 'ativo' && estaProximosDias(f.nascimento, 30)
    ).length
  }, [todosOsFuncionarios])

  const totalAniversariosEmpresaProximos = useMemo(() => {
    return todosOsFuncionarios.filter(
      (f: Funcionario) => f.admissao && f.status === 'ativo' && estaProximosDias(f.admissao, 30) && calcularTempoEmpresaAnos(f.admissao) >= 0
    ).length
  }, [todosOsFuncionarios])

  const totalAfastados = funcionariosAfastados.length
  const totalExperiencias = experienciasVencendo.length

  return {
    // Estado
    carregando,
    
    // Totais
    totalFuncionarios,
    totalEmpresas,
    totalAniversariosProximos,
    totalAniversariosEmpresaProximos,
    totalAfastados,
    totalExperiencias,
    
    // Listas
    funcionariosPorEmpresa,
    aniversariantesNascimento,
    aniversariantesEmpresa,
    experienciasVencendo,
    funcionariosAfastados,
    empresas,
    
    // Turnover
    dadosTurnover,
    turnoverEmpresa,
    setTurnoverEmpresa,
    turnoverMes,
    setTurnoverMes,
    turnoverAno,
    setTurnoverAno,
    
    // Filtros nascimento
    filtroAnivNasc,
    setFiltroAnivNasc,
    mesAnivNasc,
    setMesAnivNasc,
    
    // Filtros empresa
    filtroAnivEmp,
    setFiltroAnivEmp,
    mesAnivEmp,
    setMesAnivEmp,
  }
}