'use client'

import { useEffect, useState } from 'react'
import { buscarTodosMeses, calcularResumoMensal, ResumoMensal } from '@/services/dreService'
import { CardIndicador } from '@/components/dashboard/CardIndicador'
import { GraficoEvolucao } from '@/components/dashboard/GraficoEvolucao'
import { GraficoPizza } from '@/components/dashboard/GraficoPizza'
import { GraficoReceitaDespesa } from '@/components/dashboard/GraficoReceitaDespesa'
import { TabelaResumo } from '@/components/dashboard/TabelaResumo'
import Link from 'next/link'
import { FileText, BarChart3, Download } from 'lucide-react'
import * as XLSX from 'xlsx'

export default function Dashboard() {
  const [resumos, setResumos] = useState<ResumoMensal[]>([])
  const [carregando, setCarregando] = useState(true)
  const [mesSelecionado, setMesSelecionado] = useState(0)

  useEffect(() => {
    async function carregar() {
      setCarregando(true)
      const todosMeses = await buscarTodosMeses()
      
      const resumosMensais = todosMeses.map(m => 
        calcularResumoMensal(m.dados, m.mes, m.label)
      )
      
      setResumos(resumosMensais)
      setCarregando(false)
    }
    carregar()
  }, [])

  const mesAtual = resumos[mesSelecionado] || resumos[0]

  // Acumulado para gráfico de pizza
  const acumulado = {
    impostos: resumos.reduce((acc, d) => acc + d.impostos, 0),
    despesasOperacionais: resumos.reduce((acc, d) => acc + d.despesasOperacionais, 0),
    gestaoPessoas: resumos.reduce((acc, d) => acc + d.gestaoPessoas, 0),
    cmv: resumos.reduce((acc, d) => acc + d.cmv, 0),
  }

  const despesasAcumulado = [
    { nome: 'CMV', valor: acumulado.cmv },
    { nome: 'Gestão Pessoas', valor: acumulado.gestaoPessoas },
    { nome: 'Desp. Operacionais', valor: acumulado.despesasOperacionais },
    { nome: 'Impostos', valor: acumulado.impostos },
  ]

  // Função exportar Excel
  const exportarExcel = () => {
    const dadosExcel = [
      ['Conta', ...resumos.map(r => r.label), 'ACUMULADO'],
      [],
      ['RECEITAS'],
      ['Receitas Operacionais', ...resumos.map(r => r.receitasOperacionais), resumos.reduce((a, r) => a + r.receitasOperacionais, 0)],
      ['Descontos Recebidos', ...resumos.map(r => r.descontosRecebidos), resumos.reduce((a, r) => a + r.descontosRecebidos, 0)],
      ['TOTAL RECEITAS', ...resumos.map(r => r.totalReceitas), resumos.reduce((a, r) => a + r.totalReceitas, 0)],
      [],
      ['DESPESAS'],
      ['Impostos', ...resumos.map(r => r.impostos), resumos.reduce((a, r) => a + r.impostos, 0)],
      ['Despesas Operacionais', ...resumos.map(r => r.despesasOperacionais), resumos.reduce((a, r) => a + r.despesasOperacionais, 0)],
      ['Gestão de Pessoas', ...resumos.map(r => r.gestaoPessoas), resumos.reduce((a, r) => a + r.gestaoPessoas, 0)],
      ['CMV (Compra Mercadorias)', ...resumos.map(r => r.cmv), resumos.reduce((a, r) => a + r.cmv, 0)],
      ['TOTAL DESPESAS', ...resumos.map(r => r.totalDespesas), resumos.reduce((a, r) => a + r.totalDespesas, 0)],
      [],
      ['RESULTADO OPERAÇÃO', ...resumos.map(r => r.resultadoOperacao), resumos.reduce((a, r) => a + r.resultadoOperacao, 0)],
    ]

    const ws = XLSX.utils.aoa_to_sheet(dadosExcel)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Resumo DRE')
    XLSX.writeFile(wb, 'resumo_dre_tophaus.xlsx')
  }

  if (carregando) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-blue-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
          </div>
          <p className="text-slate-600 font-medium">Carregando dados...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-2 rounded-xl">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">Dashboard Financeiro</h1>
                <p className="text-sm text-slate-500">Top Haus</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={exportarExcel}
                className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl hover:bg-emerald-700 transition-colors font-medium text-sm"
              >
                <Download className="w-4 h-4" />
                Exportar Excel
              </button>
              <Link 
                href="/detalhes"
                className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2.5 rounded-xl hover:bg-slate-700 transition-colors font-medium text-sm"
              >
                <FileText className="w-4 h-4" />
                DRE Detalhado
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Cards de indicadores */}
        {mesAtual && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm font-medium text-slate-500">Indicadores</span>
              <select
                value={mesSelecionado}
                onChange={(e) => setMesSelecionado(Number(e.target.value))}
                className="bg-blue-100 text-blue-700 text-sm font-semibold px-3 py-1.5 rounded-full border-none cursor-pointer hover:bg-blue-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                {resumos.map((r, idx) => (
                  <option key={r.mes} value={idx}>{r.label}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <CardIndicador titulo="Total Receitas" valor={mesAtual.totalReceitas} tipo="receita" />
              <CardIndicador titulo="Total Despesas" valor={mesAtual.totalDespesas} tipo="despesa" />
              <CardIndicador titulo="Resultado" valor={mesAtual.resultadoOperacao} tipo="resultado" />
              <CardIndicador 
                titulo="Margem Operacional" 
                valor={mesAtual.totalReceitas > 0 ? (mesAtual.resultadoOperacao / mesAtual.totalReceitas) * 100 : 0} 
                tipo="margem" 
              />
            </div>
          </div>
        )}

        {/* Tabela Resumo */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Resumo Mensal Consolidado</h2>
          <TabelaResumo dados={resumos} />
        </div>

        {/* Gráfico Principal */}
        <div className="mb-6">
          <GraficoReceitaDespesa dados={resumos} titulo="Evolução Receitas x Despesas x Resultado" />
        </div>

        {/* Gráficos Secundários */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GraficoEvolucao dados={resumos} titulo="Composição Despesas por Mês" />
          <GraficoPizza dados={despesasAcumulado} titulo="Composição Despesas (Acumulado)" />
        </div>
      </div>
    </main>
  )
}