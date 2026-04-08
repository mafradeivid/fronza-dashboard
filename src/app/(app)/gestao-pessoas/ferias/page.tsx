// ============================================
// PÁGINA: FÉRIAS - VISÃO GERAL
// Design: Executive Dashboard - Sofisticado
// ============================================

'use client'

import Link from 'next/link'
import { useState } from 'react'
import { 
  Calendar, 
  Users, 
  Clock, 
  ChevronRight, 
  Plus,
  AlertTriangle,
  Sparkles,
  ClipboardList,
} from 'lucide-react'
import { useFerias } from '@/hooks/ferias/useFerias'
import { formatarData } from '@/utils/formatters'
import type { Empresa } from '@/types/empresa'

export default function FeriasPage() {
  const [empresaSelecionada, setEmpresaSelecionada] = useState<number | null>(null)

  const { 
    estatisticas, 
    alertasCriticos,
    feriasProgramadas,
    feriasEmAndamento,
    empresas,
    carregando,
  } = useFerias(empresaSelecionada)

  const handleEmpresaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setEmpresaSelecionada(e.target.value ? Number(e.target.value) : null)
  }

  // Combinar e ordenar férias (em gozo primeiro, depois programadas por data)
  const todasFerias = [
    ...feriasEmAndamento.map(f => ({ ...f, tipo: 'em_gozo' as const })),
    ...feriasProgramadas.map(f => ({ ...f, tipo: 'programado' as const })),
  ].sort((a, b) => {
    // Em gozo vem primeiro
    if (a.tipo === 'em_gozo' && b.tipo !== 'em_gozo') return -1
    if (b.tipo === 'em_gozo' && a.tipo !== 'em_gozo') return 1
    // Depois ordena por data de início
    return new Date(a.data_inicio).getTime() - new Date(b.data_inicio).getTime()
  })

  // Períodos a programar (fallback para funcionariosComSaldo se não existir)
  const periodosAProgramar = estatisticas?.periodosAProgramar ?? estatisticas?.funcionariosComSaldo ?? 0

  return (
    <div className="min-h-screen bg-[#0F172A]">
      {/* Gradient Background Overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5 pointer-events-none" />
      
      {/* Header */}
      <header className="relative border-b border-white/5">
        <div className="px-8 py-10">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-teal-500/20">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <span className="text-teal-400 text-sm font-medium tracking-wide uppercase">
                  Gestão de Pessoas
                </span>
              </div>
              <h1 className="text-4xl font-bold text-white tracking-tight">
                Férias
              </h1>
              <p className="text-slate-400 mt-2 text-lg">
                Controle de períodos aquisitivos e programações
              </p>
            </div>

            <Link
              href="/gestao-pessoas/ferias/programacao"
              className="group flex items-center gap-3 px-6 py-3.5 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl text-white font-semibold shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 hover:scale-[1.02] transition-all duration-300"
            >
              <Plus className="w-5 h-5" />
              Nova Programação
              <ChevronRight className="w-4 h-4 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all" />
            </Link>
          </div>

          {/* Filtro de Empresa */}
          <div className="mt-8">
            <select
              value={empresaSelecionada || ''}
              onChange={handleEmpresaChange}
              className="px-5 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 outline-none min-w-[280px] backdrop-blur-sm transition-all hover:bg-white/10"
            >
              <option value="" className="bg-slate-800">Todas as empresas</option>
              {empresas.filter((e: Empresa) => e.id !== undefined).map((empresa: Empresa) => (
                <option key={empresa.id} value={empresa.id} className="bg-slate-800">
                  {empresa.razao_social}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <main className="relative px-8 py-8 space-y-8">
        {/* Cards de Métricas - 4 cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card Férias a Programar */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-500/20 to-teal-500/5 border border-teal-500/30 p-6 hover:border-teal-500/50 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-teal-500/30 flex items-center justify-center">
                  <ClipboardList className="w-6 h-6 text-teal-400" />
                </div>
                {periodosAProgramar > 0 && (
                  <span className="px-2.5 py-1 bg-teal-500/20 text-teal-400 text-xs font-bold rounded-full">
                    PENDENTE
                  </span>
                )}
              </div>
              <p className="text-slate-400 text-sm font-medium mb-1">Férias a Programar</p>
              <p className="text-4xl font-bold text-teal-400 tracking-tight">
                {carregando ? '—' : periodosAProgramar}
              </p>
              <p className="text-slate-500 text-sm mt-2">
                períodos pendentes
              </p>
            </div>
          </div>

          {/* Card Programadas */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10 p-6 hover:border-white/20 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-cyan-400" />
                </div>
                <Sparkles className="w-5 h-5 text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-slate-400 text-sm font-medium mb-1">Programadas</p>
              <p className="text-4xl font-bold text-white tracking-tight">
                {carregando ? '—' : estatisticas?.totalDiasProgramados || 0}
              </p>
              <p className="text-slate-500 text-sm mt-2">
                dias agendados
              </p>
            </div>
          </div>

          {/* Card Críticos */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10 p-6 hover:border-amber-500/30 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-amber-400" />
                </div>
                {(estatisticas?.periodosCriticos || 0) > 0 && (
                  <span className="flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                  </span>
                )}
              </div>
              <p className="text-slate-400 text-sm font-medium mb-1">Períodos Críticos</p>
              <p className="text-4xl font-bold text-white tracking-tight">
                {carregando ? '—' : estatisticas?.periodosCriticos || 0}
              </p>
              <p className="text-slate-500 text-sm mt-2">
                Vencendo em 30 dias
              </p>
            </div>
          </div>

          {/* Card Vencidos */}
          <div className={`group relative overflow-hidden rounded-2xl border p-6 transition-all duration-500 ${
            (estatisticas?.periodosVencidos || 0) > 0 
              ? 'bg-gradient-to-br from-red-500/20 to-red-500/5 border-red-500/30 hover:border-red-500/50' 
              : 'bg-gradient-to-br from-white/[0.08] to-white/[0.02] border-white/10 hover:border-white/20'
          }`}>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  (estatisticas?.periodosVencidos || 0) > 0 ? 'bg-red-500/30' : 'bg-red-500/20'
                }`}>
                  <AlertTriangle className={`w-6 h-6 ${
                    (estatisticas?.periodosVencidos || 0) > 0 ? 'text-red-400' : 'text-red-400/60'
                  }`} />
                </div>
                {(estatisticas?.periodosVencidos || 0) > 0 && (
                  <span className="px-2.5 py-1 bg-red-500/20 text-red-400 text-xs font-bold rounded-full">
                    URGENTE
                  </span>
                )}
              </div>
              <p className="text-slate-400 text-sm font-medium mb-1">Férias Vencidas</p>
              <p className={`text-4xl font-bold tracking-tight ${
                (estatisticas?.periodosVencidos || 0) > 0 ? 'text-red-400' : 'text-white'
              }`}>
                {carregando ? '—' : estatisticas?.periodosVencidos || 0}
              </p>
              <p className="text-slate-500 text-sm mt-2">
                Requer ação imediata
              </p>
            </div>
          </div>
        </div>

        {/* Grid Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Alertas Críticos */}
          <div className="rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10 overflow-hidden">
            <div className="px-6 py-5 border-b border-white/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Atenção Necessária</h3>
                    <p className="text-slate-500 text-sm">{alertasCriticos.length} período{alertasCriticos.length !== 1 ? 's' : ''} requer{alertasCriticos.length === 1 ? '' : 'em'} ação</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="divide-y divide-white/5 max-h-[400px] overflow-y-auto">
              {alertasCriticos.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-emerald-400" />
                  </div>
                  <p className="text-slate-400">Nenhum alerta no momento</p>
                  <p className="text-slate-600 text-sm mt-1">Tudo em dia!</p>
                </div>
              ) : (
                alertasCriticos.slice(0, 5).map((alerta) => (
                  <div 
                    key={alerta.periodo_id}
                    className="px-6 py-4 hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${
                          alerta.nivel_urgencia === 'vencido' 
                            ? 'bg-red-500/20 text-red-400' 
                            : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {alerta.nome_completo.split(' ').slice(0, 2).map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-white font-medium">{alerta.nome_completo}</p>
                          <p className="text-slate-500 text-sm">
                            {alerta.periodo_numero}º período • {alerta.dias_restantes} dias de saldo
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-semibold ${
                          alerta.nivel_urgencia === 'vencido' ? 'text-red-400' : 'text-amber-400'
                        }`}>
                          {alerta.dias_para_vencer < 0 
                            ? `Vencido há ${Math.abs(alerta.dias_para_vencer)}d`
                            : `${alerta.dias_para_vencer}d restantes`
                          }
                        </p>
                        <p className="text-slate-600 text-xs">{formatarData(alerta.data_limite_concessao)}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {alertasCriticos.length > 5 && (
              <Link
                href="/gestao-pessoas/ferias/periodos"
                className="block px-6 py-4 text-center text-teal-400 hover:text-teal-300 text-sm font-medium border-t border-white/5 hover:bg-white/[0.02] transition-colors"
              >
                Ver todos os {alertasCriticos.length} alertas
              </Link>
            )}
          </div>

          {/* Calendário de Férias (Lista) */}
          <div className="rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10 overflow-hidden">
            <div className="px-6 py-5 border-b border-white/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-teal-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Calendário de Férias</h3>
                    <p className="text-slate-500 text-sm">
                      {feriasEmAndamento.length > 0 && `${feriasEmAndamento.length} em gozo`}
                      {feriasEmAndamento.length > 0 && feriasProgramadas.length > 0 && ' • '}
                      {feriasProgramadas.length > 0 && `${feriasProgramadas.length} programada${feriasProgramadas.length !== 1 ? 's' : ''}`}
                      {feriasEmAndamento.length === 0 && feriasProgramadas.length === 0 && 'Nenhuma férias agendada'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="divide-y divide-white/5 max-h-[400px] overflow-y-auto">
              {todasFerias.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-slate-500/10 flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-slate-500" />
                  </div>
                  <p className="text-slate-400">Nenhuma férias programada</p>
                  <Link
                    href="/gestao-pessoas/ferias/programacao"
                    className="inline-flex items-center gap-2 mt-4 text-teal-400 hover:text-teal-300 text-sm font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    Programar férias
                  </Link>
                </div>
              ) : (
                todasFerias.slice(0, 10).map((f) => (
                  <div 
                    key={f.id} 
                    className={`px-6 py-4 ${f.tipo === 'em_gozo' ? 'bg-amber-500/5' : 'hover:bg-white/[0.02]'} transition-colors`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${
                          f.tipo === 'em_gozo' 
                            ? 'bg-amber-500/20 text-amber-400' 
                            : 'bg-teal-500/20 text-teal-400'
                        }`}>
                          {f.funcionario?.nome_completo?.split(' ').slice(0, 2).map(n => n[0]).join('') || '??'}
                        </div>
                        <div>
                          <p className="text-white font-medium">{f.funcionario?.nome_completo}</p>
                          <p className="text-slate-500 text-sm">
                            {formatarData(f.data_inicio)} a {formatarData(f.data_fim)}
                            <span className="text-slate-600"> • {f.dias_gozados} dias</span>
                          </p>
                        </div>
                      </div>
                      <span className={`px-3 py-1.5 text-xs font-semibold rounded-full ${
                        f.tipo === 'em_gozo' 
                          ? 'bg-amber-500/20 text-amber-400' 
                          : 'bg-teal-500/20 text-teal-400'
                      }`}>
                        {f.tipo === 'em_gozo' ? 'Em gozo' : 'Programada'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {todasFerias.length > 0 && (
              <Link
                href="/gestao-pessoas/ferias/programacao"
                className="block px-6 py-4 text-center text-teal-400 hover:text-teal-300 text-sm font-medium border-t border-white/5 hover:bg-white/[0.02] transition-colors"
              >
                Ver todas as programações
              </Link>
            )}
          </div>
        </div>

        {/* Cards de Navegação */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Link
            href="/gestao-pessoas/ferias/periodos"
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10 p-8 hover:border-teal-500/30 transition-all duration-500"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                <Users className="w-8 h-8 text-teal-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-1">Períodos e Saldos</h3>
                <p className="text-slate-400">
                  Visualize períodos aquisitivos e saldos por colaborador
                </p>
              </div>
              <ChevronRight className="w-6 h-6 text-slate-600 group-hover:text-teal-400 group-hover:translate-x-1 transition-all" />
            </div>
          </Link>

          <Link
            href="/gestao-pessoas/ferias/programacao"
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10 p-8 hover:border-cyan-500/30 transition-all duration-500"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-teal-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                <Calendar className="w-8 h-8 text-cyan-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-1">Programação de Férias</h3>
                <p className="text-slate-400">
                  Programe e gerencie férias dos colaboradores
                </p>
              </div>
              <ChevronRight className="w-6 h-6 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
            </div>
          </Link>
        </div>
      </main>
    </div>
  )
}