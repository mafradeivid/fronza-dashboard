// ============================================
// HOOK: USE SALDO FERIAS
// Consulta de saldos e alertas
// ============================================

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  SaldoFeriasFuncionario,
  FeriasVencendo,
  NivelUrgencia,
} from '@/types/ferias'
import {
  EstatisticasFerias,
  ResumoEmpresaFerias,
  FeriasCalendario,
  // Services
  listarSaldos,
  buscarSaldoFuncionario,
  buscarComFeriasVencidas,
  buscarComAlertaVencimento,
  listarFeriasVencendo,
  buscarPeriodosCriticos,
  calcularEstatisticas,
  buscarFeriasCalendario,
  gerarResumoEmpresas,
} from '@/services/ferias'

interface UseSaldoFeriasOptions {
  empresaId?: number
  carregarCalendario?: boolean
  mesCalendario?: string // formato YYYY-MM
}

export function useSaldoFerias(options?: UseSaldoFeriasOptions) {
  // Estado
  const [saldos, setSaldos] = useState<SaldoFeriasFuncionario[]>([])
  const [feriasVencendo, setFeriasVencendo] = useState<FeriasVencendo[]>([])
  const [estatisticas, setEstatisticas] = useState<EstatisticasFerias | null>(null)
  const [resumoEmpresas, setResumoEmpresas] = useState<ResumoEmpresaFerias[]>([])
  const [calendario, setCalendario] = useState<FeriasCalendario[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  // Filtros
  const [filtroNome, setFiltroNome] = useState('')
  const [filtroStatus, setFiltroStatus] = useState<'todos' | 'com_saldo' | 'sem_saldo' | 'vencidas' | 'alerta'>('todos')

  // ============================================
  // CARREGAMENTO
  // ============================================

  const carregar = useCallback(async () => {
    setCarregando(true)
    setErro(null)

    try {
      const [
        dadosSaldos,
        dadosVencendo,
        dadosEstatisticas,
        dadosResumo,
      ] = await Promise.all([
        listarSaldos(options?.empresaId),
        listarFeriasVencendo(options?.empresaId),
        calcularEstatisticas(options?.empresaId),
        gerarResumoEmpresas(),
      ])

      setSaldos(dadosSaldos)
      setFeriasVencendo(dadosVencendo)
      setEstatisticas(dadosEstatisticas)
      setResumoEmpresas(dadosResumo)

      // Carregar calendário se solicitado
      if (options?.carregarCalendario) {
        const mes = options.mesCalendario || new Date().toISOString().slice(0, 7)
        const inicio = `${mes}-01`
        const fim = new Date(parseInt(mes.slice(0, 4)), parseInt(mes.slice(5, 7)), 0)
          .toISOString().split('T')[0]
        
        const dadosCalendario = await buscarFeriasCalendario(
          options.empresaId,
          inicio,
          fim
        )
        setCalendario(dadosCalendario)
      }
    } catch (error) {
      console.error('Erro ao carregar saldos:', error)
      setErro('Erro ao carregar saldos de férias')
    } finally {
      setCarregando(false)
    }
  }, [options?.empresaId, options?.carregarCalendario, options?.mesCalendario])

  useEffect(() => {
    carregar()
  }, [carregar])

  // ============================================
  // FILTROS
  // ============================================

  const saldosFiltrados = useMemo(() => {
    let resultado = [...saldos]

    // Filtro por nome
    if (filtroNome.trim()) {
      const busca = filtroNome.toLowerCase()
      resultado = resultado.filter(s => 
        s.nome_completo.toLowerCase().includes(busca)
      )
    }

    // Filtro por status
    switch (filtroStatus) {
      case 'com_saldo':
        resultado = resultado.filter(s => s.saldo_disponivel > 0)
        break
      case 'sem_saldo':
        resultado = resultado.filter(s => s.saldo_disponivel <= 0)
        break
      case 'vencidas':
        resultado = resultado.filter(s => s.tem_ferias_vencidas)
        break
      case 'alerta':
        resultado = resultado.filter(s => s.alerta_vencendo)
        break
    }

    return resultado
  }, [saldos, filtroNome, filtroStatus])

  // ============================================
  // AGRUPAMENTOS
  // ============================================

  const funcionariosComProblemas = useMemo(() => ({
    comVencidas: saldos.filter(s => s.tem_ferias_vencidas),
    comAlerta: saldos.filter(s => s.alerta_vencendo && !s.tem_ferias_vencidas),
  }), [saldos])

  const feriasVencendoPorUrgencia = useMemo(() => {
    const grupos: Record<NivelUrgencia, FeriasVencendo[]> = {
      ok: [],
      atencao: [],
      alerta: [],
      critico: [],
      vencido: [],
    }

    feriasVencendo.forEach(f => {
      grupos[f.nivel_urgencia].push(f)
    })

    return grupos
  }, [feriasVencendo])

  const alertasCriticos = useMemo(() => {
    return feriasVencendo.filter(f => 
      f.nivel_urgencia === 'critico' || f.nivel_urgencia === 'vencido'
    )
  }, [feriasVencendo])

  // ============================================
  // CONSULTAS ESPECÍFICAS
  // ============================================

  const buscarSaldo = useCallback(async (
    funcionarioId: number
  ): Promise<SaldoFeriasFuncionario | null> => {
    return buscarSaldoFuncionario(funcionarioId)
  }, [])

  const carregarMesCalendario = useCallback(async (mes: string) => {
    try {
      const inicio = `${mes}-01`
      const fim = new Date(parseInt(mes.slice(0, 4)), parseInt(mes.slice(5, 7)), 0)
        .toISOString().split('T')[0]
      
      const dados = await buscarFeriasCalendario(options?.empresaId, inicio, fim)
      setCalendario(dados)
      return dados
    } catch (error) {
      console.error('Erro ao carregar calendário:', error)
      return []
    }
  }, [options?.empresaId])

  // ============================================
  // RETORNO
  // ============================================

  return {
    // Dados
    saldos,
    saldosFiltrados,
    feriasVencendo,
    estatisticas,
    resumoEmpresas,
    calendario,
    carregando,
    erro,

    // Filtros
    filtroNome,
    setFiltroNome,
    filtroStatus,
    setFiltroStatus,

    // Agrupamentos
    funcionariosComProblemas,
    feriasVencendoPorUrgencia,
    alertasCriticos,

    // Ações
    carregar,
    buscarSaldo,
    carregarMesCalendario,
    setErro,
  }
}