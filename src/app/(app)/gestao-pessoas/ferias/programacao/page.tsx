// ============================================
// PÁGINA: PROGRAMAR FÉRIAS
// Orquestra componentes - ~100 linhas
// ============================================

'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { ArrowLeft, Calendar, AlertTriangle } from 'lucide-react'
import { useProgramacaoFerias } from '@/hooks/ferias'
import { useEmpresas } from '@/hooks/useEmpresas'
import { PeriodoParaProgramacao } from '@/types/ferias'
import {
  FuncionarioAgrupado,
  FiltrosProgramacaoBarra,
  ListaFuncionarios,
  ModalFuncionario,
  agruparPorFuncionario,
} from '@/components/gestao-pessoas/ferias/programacao'

export default function ProgramacaoPage() {
  // Estado do modal
  const [funcionarioAberto, setFuncionarioAberto] = useState<FuncionarioAgrupado | null>(null)
  const [periodoInicial, setPeriodoInicial] = useState<number | null>(null)

  // Hooks
  const { empresas } = useEmpresas()
  const {
    periodos,
    estatisticas,
    filtros,
    carregando,
    erro,
    salvando,
    temAlertas,
    alterarFiltro,
    calcularPrevia,
    programarFerias,
    carregarDados,
  } = useProgramacaoFerias()

  // Agrupar por funcionário
  const funcionariosAgrupados = useMemo(() => agruparPorFuncionario(periodos), [periodos])

  // Handlers
  const handleAbrirFuncionario = (func: FuncionarioAgrupado) => {
    setFuncionarioAberto(func)
    setPeriodoInicial(null)
  }

  const handleFecharModal = () => {
    setFuncionarioAberto(null)
    setPeriodoInicial(null)
  }

  const handleAtualizar = async () => {
    await carregarDados()
    // Atualizar funcionário aberto se ainda existir
    if (funcionarioAberto) {
      const atualizado = funcionariosAgrupados.find(
        f => f.funcionario_id === funcionarioAberto.funcionario_id
      )
      setFuncionarioAberto(atualizado || null)
    }
  }

  // Encontrar período inicial se houver
  const periodoInicialObj = periodoInicial
    ? funcionarioAberto?.periodos.find((p: PeriodoParaProgramacao) => p.id === periodoInicial)
    : null

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="px-6 py-4">
          <Link
            href="/gestao-pessoas/ferias"
            className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors mb-3 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-slate-900">Programar Férias</h1>
              <p className="text-slate-500 text-sm mt-0.5">
                {funcionariosAgrupados.length} funcionário(s) com períodos disponíveis
              </p>
            </div>

            <Link
              href="/gestao-pessoas/ferias/programacao/calendario"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-teal-700 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors"
            >
              <Calendar className="w-4 h-4" />
              Ver Calendário
            </Link>
          </div>
        </div>
      </header>

      <main className="px-6 py-6">
        {/* Alertas */}
        {estatisticas && temAlertas && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <p className="text-amber-800 text-sm">
              <strong>{estatisticas.vencidos}</strong> períodos vencidos
              {estatisticas.criticos > 0 && <> · <strong>{estatisticas.criticos}</strong> críticos</>}
              {estatisticas.atencao > 0 && <> · <strong>{estatisticas.atencao}</strong> atenção</>}
            </p>
          </div>
        )}

        {/* Filtros */}
        <FiltrosProgramacaoBarra
          filtros={filtros}
          empresas={empresas}
          onFiltroChange={alterarFiltro}
        />

        {/* Lista */}
        <ListaFuncionarios
          funcionarios={funcionariosAgrupados}
          carregando={carregando}
          erro={erro}
          onAbrirFuncionario={handleAbrirFuncionario}
        />
      </main>

      {/* Modal */}
      {funcionarioAberto && (
        <ModalFuncionario
          funcionario={funcionarioAberto}
          periodoInicial={periodoInicialObj}
          salvando={salvando}
          onFechar={handleFecharModal}
          onCalcular={calcularPrevia}
          onSalvar={programarFerias}
          onAtualizar={handleAtualizar}
        />
      )}
    </div>
  )
}