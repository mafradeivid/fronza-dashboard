import { useState, useMemo } from 'react'
import { useFuncionarios } from './useFuncionarios'
import { Funcionario } from '@/types/pessoas'
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

export function useVisaoGeralRH() {
  const { todosOsFuncionarios, empresas, carregando } = useFuncionarios()
  
  // Filtros de aniversário de nascimento
  const [filtroAnivNasc, setFiltroAnivNasc] = useState<FiltroAniversario>('proximos30')
  const [mesAnivNasc, setMesAnivNasc] = useState(new Date().getMonth() + 1)
  
  // Filtros de aniversário de empresa
  const [filtroAnivEmp, setFiltroAnivEmp] = useState<FiltroAniversario>('proximos30')
  const [mesAnivEmp, setMesAnivEmp] = useState(new Date().getMonth() + 1)

  // Funcionários por empresa
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

  // Aniversariantes de nascimento
  const aniversariantesNascimento = useMemo<AniversarianteNascimento[]>(() => {
    const lista: AniversarianteNascimento[] = []
    
    todosOsFuncionarios.forEach((func: Funcionario) => {
      if (!func.nascimento) return
      
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

  // Aniversariantes de empresa
  const aniversariantesEmpresa = useMemo<AniversarianteEmpresa[]>(() => {
    const lista: AniversarianteEmpresa[] = []
    
    todosOsFuncionarios.forEach((func: Funcionario) => {
      if (!func.admissao) return
      
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

  // Contadores para cards
  const totalFuncionarios = todosOsFuncionarios.length
  const totalEmpresas = empresas.length
  
  const totalAniversariosProximos = useMemo(() => {
    return todosOsFuncionarios.filter(
      (f: Funcionario) => f.nascimento && estaProximosDias(f.nascimento, 30)
    ).length
  }, [todosOsFuncionarios])

  const totalAniversariosEmpresaProximos = useMemo(() => {
    return todosOsFuncionarios.filter(
      (f: Funcionario) => f.admissao && estaProximosDias(f.admissao, 30) && calcularTempoEmpresaAnos(f.admissao) >= 0
    ).length
  }, [todosOsFuncionarios])

  return {
    // Estado
    carregando,
    
    // Totais
    totalFuncionarios,
    totalEmpresas,
    totalAniversariosProximos,
    totalAniversariosEmpresaProximos,
    
    // Listas
    funcionariosPorEmpresa,
    aniversariantesNascimento,
    aniversariantesEmpresa,
    
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