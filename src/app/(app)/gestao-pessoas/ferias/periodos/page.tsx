// ============================================
// PÁGINA: PERÍODOS E SALDOS
// Design: Executive Dashboard - Sofisticado
// ============================================

'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft,
  Calendar,
  ChevronDown,
  ChevronRight,
  Filter,
  Search,
  Users,
} from 'lucide-react'
import { usePeriodosAquisitivos } from '@/hooks/ferias'
import { useEmpresas } from '@/hooks/useEmpresas'
import { formatarData } from '@/utils/formatters'
import { STATUS_PERIODO_LABELS } from '@/types/ferias'
import type { Empresa } from '@/types/empresa'

// Cores customizadas para status
const STATUS_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  adquirido: { 
    bg: 'bg-emerald-500/20', 
    text: 'text-emerald-400', 
    border: 'border-emerald-500/30' 
  },
  em_aquisicao: { 
    bg: 'bg-cyan-500/20', 
    text: 'text-cyan-400', 
    border: 'border-cyan-500/30' 
  },
  parcial: { 
    bg: 'bg-amber-500/20', 
    text: 'text-amber-400', 
    border: 'border-amber-500/30' 
  },
  quitado: { 
    bg: 'bg-slate-500/20', 
    text: 'text-slate-400', 
    border: 'border-slate-500/30' 
  },
  vencido: { 
    bg: 'bg-red-500/20', 
    text: 'text-red-400', 
    border: 'border-red-500/30' 
  },
}

export default function PeriodosSaldosPage() {
  const [empresaSelecionada, setEmpresaSelecionada] = useState<number | undefined>(undefined)
  const [busca, setBusca] = useState('')
  const [statusFiltro, setStatusFiltro] = useState<string | null>(null)
  const [expandidos, setExpandidos] = useState<Set<number>>(new Set())

  // Hooks
  const { empresas } = useEmpresas()
  const { periodos, carregando } = usePeriodosAquisitivos({ empresaId: empresaSelecionada })

  // Agrupar por funcionário
  const funcionariosAgrupados = useMemo(() => {
    const mapa = new Map<number, {
      funcionario: { id: number; nome_completo: string; empresa_id: number; admissao: string }
      periodos: typeof periodos
      totalDireito: number
      totalGozados: number
      totalVendidos: number
      totalSaldo: number
    }>()

    periodos
      .filter(p => {
        if (statusFiltro && p.status !== statusFiltro) return false
        if (busca && !p.funcionario?.nome_completo.toLowerCase().includes(busca.toLowerCase())) return false
        return true
      })
      .forEach(p => {
        if (!p.funcionario) return
        const id = p.funcionario.id

        if (!mapa.has(id)) {
          mapa.set(id, {
            funcionario: p.funcionario,
            periodos: [],
            totalDireito: 0,
            totalGozados: 0,
            totalVendidos: 0,
            totalSaldo: 0,
          })
        }

        const grupo = mapa.get(id)!
        grupo.periodos.push(p)
        grupo.totalDireito += p.dias_direito
        grupo.totalGozados += p.dias_gozados
        grupo.totalVendidos += p.dias_vendidos
        grupo.totalSaldo += (p.dias_direito - p.dias_gozados - p.dias_vendidos)
      })

    return Array.from(mapa.values()).sort((a, b) => 
      a.funcionario.nome_completo.localeCompare(b.funcionario.nome_completo)
    )
  }, [periodos, busca, statusFiltro])

  const toggleExpansao = (id: number) => {
    const novos = new Set(expandidos)
    if (novos.has(id)) {
      novos.delete(id)
    } else {
      novos.add(id)
    }
    setExpandidos(novos)
  }

  const expandirTodos = () => {
    if (expandidos.size === funcionariosAgrupados.length) {
      setExpandidos(new Set())
    } else {
      setExpandidos(new Set(funcionariosAgrupados.map(f => f.funcionario.id)))
    }
  }

  const getIniciais = (nome: string) => {
    return nome.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
  }

  const handleEmpresaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setEmpresaSelecionada(e.target.value ? Number(e.target.value) : undefined)
  }

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFiltro(e.target.value || null)
  }

  return (
    <div className="min-h-screen bg-[#0F172A]">
      {/* Gradient Background Overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5 pointer-events-none" />

      {/* Header */}
      <header className="relative border-b border-white/5">
        <div className="px-8 py-8">
          <Link
            href="/gestao-pessoas/ferias"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Voltar para Férias
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-teal-500/20">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <span className="text-teal-400 text-sm font-medium tracking-wide uppercase">
                  Férias
                </span>
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tight">
                Períodos e Saldos
              </h1>
              <p className="text-slate-400 mt-1">
                {funcionariosAgrupados.length} colaborador{funcionariosAgrupados.length !== 1 ? 'es' : ''} com períodos
              </p>
            </div>
          </div>

          {/* Filtros */}
          <div className="mt-6 flex flex-wrap items-center gap-4">
            {/* Busca */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                placeholder="Buscar colaborador..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 outline-none backdrop-blur-sm transition-all"
              />
            </div>

            {/* Empresa */}
            <select
              value={empresaSelecionada || ''}
              onChange={handleEmpresaChange}
              className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 outline-none min-w-[200px] backdrop-blur-sm transition-all hover:bg-white/10"
            >
              <option value="" className="bg-slate-800">Todas empresas</option>
              {empresas.filter((e: Empresa) => e.id !== undefined).map((empresa: Empresa) => (
                <option key={empresa.id} value={empresa.id} className="bg-slate-800">
                  {empresa.razao_social}
                </option>
              ))}
            </select>

            {/* Status */}
            <select
              value={statusFiltro || ''}
              onChange={handleStatusChange}
              className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 outline-none min-w-[180px] backdrop-blur-sm transition-all hover:bg-white/10"
            >
              <option value="" className="bg-slate-800">Todos os status</option>
              <option value="adquirido" className="bg-slate-800">Adquirido</option>
              <option value="em_aquisicao" className="bg-slate-800">Em Aquisição</option>
              <option value="parcial" className="bg-slate-800">Parcial</option>
              <option value="vencido" className="bg-slate-800">Vencido</option>
              <option value="quitado" className="bg-slate-800">Quitado</option>
            </select>

            {/* Expandir/Colapsar */}
            <button
              onClick={expandirTodos}
              className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              {expandidos.size === funcionariosAgrupados.length ? 'Colapsar' : 'Expandir'} todos
            </button>
          </div>
        </div>
      </header>

      <main className="relative px-8 py-6">
        {carregando ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : funcionariosAgrupados.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-slate-500/10 flex items-center justify-center mx-auto mb-6">
              <Users className="w-10 h-10 text-slate-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Nenhum período encontrado</h3>
            <p className="text-slate-400">Ajuste os filtros ou aguarde a geração dos períodos</p>
          </div>
        ) : (
          <div className="space-y-4">
            {funcionariosAgrupados.map(({ funcionario, periodos: periodosFunc, totalDireito, totalGozados, totalVendidos, totalSaldo }) => {
              const expandido = expandidos.has(funcionario.id)
              const empresa = empresas.find((e: Empresa) => e.id !== undefined && e.id === funcionario.empresa_id)

              return (
                <div
                  key={funcionario.id}
                  className="rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10 overflow-hidden hover:border-white/20 transition-all duration-300"
                >
                  {/* Header do Funcionário */}
                  <button
                    onClick={() => toggleExpansao(funcionario.id)}
                    className="w-full px-6 py-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500/30 to-cyan-500/30 flex items-center justify-center text-teal-300 font-bold">
                        {getIniciais(funcionario.nome_completo)}
                      </div>
                      <div className="text-left">
                        <h3 className="text-lg font-semibold text-white">{funcionario.nome_completo}</h3>
                        <p className="text-slate-500 text-sm">{empresa?.razao_social || 'Empresa'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-8">
                      {/* Resumo */}
                      <div className="hidden md:flex items-center gap-6 text-sm">
                        <div className="text-center">
                          <p className="text-slate-500">Direito</p>
                          <p className="text-white font-semibold">{totalDireito}d</p>
                        </div>
                        <div className="text-center">
                          <p className="text-slate-500">Gozados</p>
                          <p className="text-white font-semibold">{totalGozados}d</p>
                        </div>
                        <div className="text-center">
                          <p className="text-slate-500">Vendidos</p>
                          <p className="text-white font-semibold">{totalVendidos}d</p>
                        </div>
                        <div className="text-center px-4 py-2 rounded-xl bg-teal-500/20">
                          <p className="text-teal-400 text-xs">Saldo</p>
                          <p className="text-teal-300 font-bold text-lg">{totalSaldo}d</p>
                        </div>
                      </div>

                      {/* Badge quantidade */}
                      <div className="flex items-center gap-3">
                        <span className="text-slate-400 text-sm">
                          {periodosFunc.length} período{periodosFunc.length !== 1 ? 's' : ''}
                        </span>
                        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${expandido ? 'rotate-180' : ''}`} />
                      </div>
                    </div>
                  </button>

                  {/* Resumo Mobile */}
                  <div className="md:hidden px-6 pb-4 flex items-center gap-4 text-sm border-t border-white/5 pt-4">
                    <div className="flex-1 text-center">
                      <p className="text-slate-500 text-xs">Direito</p>
                      <p className="text-white font-semibold">{totalDireito}d</p>
                    </div>
                    <div className="flex-1 text-center">
                      <p className="text-slate-500 text-xs">Gozados</p>
                      <p className="text-white font-semibold">{totalGozados}d</p>
                    </div>
                    <div className="flex-1 text-center">
                      <p className="text-slate-500 text-xs">Vendidos</p>
                      <p className="text-white font-semibold">{totalVendidos}d</p>
                    </div>
                    <div className="flex-1 text-center px-3 py-1.5 rounded-lg bg-teal-500/20">
                      <p className="text-teal-400 text-xs">Saldo</p>
                      <p className="text-teal-300 font-bold">{totalSaldo}d</p>
                    </div>
                  </div>

                  {/* Períodos Expandidos */}
                  {expandido && (
                    <div className="border-t border-white/5">
                      {/* Header da tabela */}
                      <div className="hidden lg:grid grid-cols-7 gap-4 px-6 py-3 bg-white/[0.02] text-xs font-medium text-slate-500 uppercase tracking-wider">
                        <div>Período</div>
                        <div>Aquisitivo</div>
                        <div>Limite</div>
                        <div className="text-center">Direito</div>
                        <div className="text-center">Gozados</div>
                        <div className="text-center">Saldo</div>
                        <div className="text-center">Status</div>
                      </div>

                      {/* Linhas dos períodos */}
                      <div className="divide-y divide-white/5">
                        {periodosFunc.map((periodo) => {
                          const saldo = periodo.dias_direito - periodo.dias_gozados - periodo.dias_vendidos
                          const style = STATUS_STYLES[periodo.status] || STATUS_STYLES.em_aquisicao

                          return (
                            <div
                              key={periodo.id}
                              className="px-6 py-4 hover:bg-white/[0.02] transition-colors"
                            >
                              {/* Desktop */}
                              <div className="hidden lg:grid grid-cols-7 gap-4 items-center">
                                <div className="flex items-center gap-2">
                                  <span className={`w-8 h-8 rounded-lg ${style.bg} ${style.text} flex items-center justify-center text-sm font-bold`}>
                                    {periodo.numero}º
                                  </span>
                                </div>
                                <div className="text-slate-300 text-sm">
                                  {formatarData(periodo.data_inicio)} - {formatarData(periodo.data_fim)}
                                </div>
                                <div className="text-slate-400 text-sm">
                                  {formatarData(periodo.data_limite_concessao)}
                                </div>
                                <div className="text-center text-white font-medium">
                                  {periodo.dias_direito}
                                </div>
                                <div className="text-center text-slate-400">
                                  {periodo.dias_gozados}
                                </div>
                                <div className={`text-center font-bold ${saldo > 0 ? 'text-teal-400' : 'text-slate-500'}`}>
                                  {saldo}
                                </div>
                                <div className="flex justify-center">
                                  <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${style.bg} ${style.text}`}>
                                    {STATUS_PERIODO_LABELS[periodo.status] || periodo.status}
                                  </span>
                                </div>
                              </div>

                              {/* Mobile */}
                              <div className="lg:hidden space-y-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <span className={`w-10 h-10 rounded-xl ${style.bg} ${style.text} flex items-center justify-center font-bold`}>
                                      {periodo.numero}º
                                    </span>
                                    <div>
                                      <p className="text-white text-sm font-medium">
                                        {formatarData(periodo.data_inicio)} - {formatarData(periodo.data_fim)}
                                      </p>
                                      <p className="text-slate-500 text-xs">
                                        Limite: {formatarData(periodo.data_limite_concessao)}
                                      </p>
                                    </div>
                                  </div>
                                  <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${style.bg} ${style.text}`}>
                                    {STATUS_PERIODO_LABELS[periodo.status] || periodo.status}
                                  </span>
                                </div>
                                <div className="flex items-center gap-4 text-sm">
                                  <div className="flex-1 text-center py-2 rounded-lg bg-white/5">
                                    <p className="text-slate-500 text-xs">Direito</p>
                                    <p className="text-white font-semibold">{periodo.dias_direito}d</p>
                                  </div>
                                  <div className="flex-1 text-center py-2 rounded-lg bg-white/5">
                                    <p className="text-slate-500 text-xs">Gozados</p>
                                    <p className="text-white font-semibold">{periodo.dias_gozados}d</p>
                                  </div>
                                  <div className={`flex-1 text-center py-2 rounded-lg ${saldo > 0 ? 'bg-teal-500/20' : 'bg-white/5'}`}>
                                    <p className={`text-xs ${saldo > 0 ? 'text-teal-400' : 'text-slate-500'}`}>Saldo</p>
                                    <p className={`font-bold ${saldo > 0 ? 'text-teal-300' : 'text-slate-400'}`}>{saldo}d</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      {/* Ação */}
                      <div className="px-6 py-4 bg-white/[0.02] flex justify-end">
                        <Link
                          href={`/gestao-pessoas/ferias/programacao?funcionario=${funcionario.id}`}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg text-white text-sm font-semibold hover:shadow-lg hover:shadow-teal-500/25 transition-all"
                        >
                          <Calendar className="w-4 h-4" />
                          Programar Férias
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}