'use client'

import { useEffect, useState } from 'react'
import { buscarTodosMeses } from '@/services/dreService'
import { ItemDetalhado } from '@/services/detalhamentoService'
import { extrairResultados } from '@/services/resultadosService'
import { TrendingUp, TrendingDown, Download, Target } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, ReferenceLine, Legend } from 'recharts'
import * as XLSX from 'xlsx'

const CORES = {
  operacional: '#8b5cf6',
  investimentos: '#f59e0b', 
  final: '#10b981',
}

export default function ResultadosPage() {
  const [itens, setItens] = useState<ItemDetalhado[]>([])
  const [meses, setMeses] = useState<string[]>([])
  const [receitaTotal, setReceitaTotal] = useState(0)
  const [receitaPorMes, setReceitaPorMes] = useState<{ [mes: string]: number }>({})
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    async function carregar() {
      setCarregando(true)
      const todosMeses = await buscarTodosMeses()
      
      const dadosPorMes = todosMeses.map(m => ({
        label: m.label,
        dados: m.dados
      }))

      const { itens, meses, receitaTotal, receitaPorMes } = extrairResultados(dadosPorMes)
      
      setItens(itens)
      setMeses(meses)
      setReceitaTotal(receitaTotal)
      setReceitaPorMes(receitaPorMes)
      setCarregando(false)
    }
    carregar()
  }, [])

  const formatarValor = (valor: number) => {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
  }

  const formatarEixo = (valor: number) => {
    return valor.toLocaleString('pt-BR', { maximumFractionDigits: 0 })
  }

  const exportarExcel = () => {
    const dadosExcel = [
      ['Resultado', ...meses, 'ACUMULADO', '% RECEITA'],
      ...itens.map(item => [
        item.descricao,
        ...meses.map(m => item.valores[m] || 0),
        item.acumulado,
        item.percentual.toFixed(2) + '%'
      ])
    ]

    const ws = XLSX.utils.aoa_to_sheet(dadosExcel)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Resultados')
    XLSX.writeFile(wb, 'detalhamento_resultados_tophaus.xlsx')
  }

  // Dados para gráfico de evolução
  const dadosEvolucao = [...meses].reverse().map(mes => ({
    mes,
    'Resultado Operacional': itens.find(i => i.descricao === 'RESULTADO OPERACIONAL')?.valores[mes] || 0,
    'Com Investimentos': itens.find(i => i.descricao === 'RESULTADO COM INVESTIMENTOS')?.valores[mes] || 0,
    'Com Receita Não Operacional': itens.find(i => i.descricao === 'RESULTADO COM RECEITA NÃO OPERACIONAL')?.valores[mes] || 0,
  }))

  // Dados para gráfico de barras comparativo
  const dadosBarras = itens.map(item => ({
    nome: item.descricao,
    valor: item.acumulado,
    percentual: item.percentual,
    cor: item.descricao === 'RESULTADO OPERACIONAL' ? CORES.operacional : 
         item.descricao === 'RESULTADO COM INVESTIMENTOS' ? CORES.investimentos : CORES.final
  }))

  if (carregando) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-purple-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-purple-600 border-t-transparent animate-spin"></div>
          </div>
          <p className="text-slate-600 font-medium">Carregando resultados...</p>
        </div>
      </div>
    )
  }

  const resultadoOperacional = itens.find(i => i.descricao === 'RESULTADO OPERACIONAL')
  const resultadoInvestimentos = itens.find(i => i.descricao === 'RESULTADO COM INVESTIMENTOS')
  const resultadoFinal = itens.find(i => i.descricao === 'RESULTADO COM RECEITA NÃO OPERACIONAL')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-2 rounded-xl">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">Detalhamento de Resultados</h1>
                <p className="text-sm text-slate-500">Análise de performance por período</p>
              </div>
            </div>
            <button
              onClick={exportarExcel}
              className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2.5 rounded-xl hover:bg-purple-700 transition-colors font-medium text-sm"
            >
              <Download className="w-4 h-4" />
              Exportar Excel
            </button>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Card Receita Total */}
        <div className="bg-gradient-to-r from-slate-700 to-slate-800 rounded-2xl p-5 text-white mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-300 text-sm font-medium">Receita Total (Base de Cálculo)</p>
              <p className="text-3xl font-bold mt-1">{formatarValor(receitaTotal)}</p>
            </div>
            <div className="text-right text-slate-400 text-sm">
              Os percentuais abaixo são calculados<br/>em relação a este valor
            </div>
          </div>
        </div>

        {/* Cards dos 3 Resultados */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Resultado Operacional */}
          <div className={`rounded-2xl p-5 ${(resultadoOperacional?.acumulado || 0) >= 0 ? 'bg-gradient-to-br from-violet-500 to-violet-600' : 'bg-gradient-to-br from-red-500 to-red-600'} text-white`}>
            <div className="flex items-center justify-between">
              <p className="text-violet-100 text-sm font-medium">Resultado Operacional</p>
              {(resultadoOperacional?.acumulado || 0) >= 0 ? <TrendingUp className="w-5 h-5 text-violet-200" /> : <TrendingDown className="w-5 h-5 text-red-200" />}
            </div>
            <p className="text-3xl font-bold mt-1">{formatarValor(resultadoOperacional?.acumulado || 0)}</p>
            <div className="flex items-center justify-between mt-2">
              <p className="text-violet-200 text-xs">Receitas - Despesas</p>
              <p className="text-white font-bold text-lg">{(resultadoOperacional?.percentual || 0).toFixed(1)}%</p>
            </div>
          </div>

          {/* Resultado com Investimentos */}
          <div className={`rounded-2xl p-5 ${(resultadoInvestimentos?.acumulado || 0) >= 0 ? 'bg-gradient-to-br from-amber-500 to-amber-600' : 'bg-gradient-to-br from-red-500 to-red-600'} text-white`}>
            <div className="flex items-center justify-between">
              <p className="text-amber-100 text-sm font-medium">Com Investimentos</p>
              {(resultadoInvestimentos?.acumulado || 0) >= 0 ? <TrendingUp className="w-5 h-5 text-amber-200" /> : <TrendingDown className="w-5 h-5 text-red-200" />}
            </div>
            <p className="text-3xl font-bold mt-1">{formatarValor(resultadoInvestimentos?.acumulado || 0)}</p>
            <div className="flex items-center justify-between mt-2">
              <p className="text-amber-200 text-xs">Operacional + Investimentos</p>
              <p className="text-white font-bold text-lg">{(resultadoInvestimentos?.percentual || 0).toFixed(1)}%</p>
            </div>
          </div>

          {/* Resultado com Receita Não Operacional */}
          <div className={`rounded-2xl p-5 ${(resultadoFinal?.acumulado || 0) >= 0 ? 'bg-gradient-to-br from-emerald-500 to-emerald-600' : 'bg-gradient-to-br from-red-500 to-red-600'} text-white`}>
            <div className="flex items-center justify-between">
              <p className="text-emerald-100 text-sm font-medium">Com Receita Não Operacional</p>
              {(resultadoFinal?.acumulado || 0) >= 0 ? <TrendingUp className="w-5 h-5 text-emerald-200" /> : <TrendingDown className="w-5 h-5 text-red-200" />}
            </div>
            <p className="text-3xl font-bold mt-1">{formatarValor(resultadoFinal?.acumulado || 0)}</p>
            <div className="flex items-center justify-between mt-2">
              <p className="text-emerald-200 text-xs">Resultado Final do Período</p>
              <p className="text-white font-bold text-lg">{(resultadoFinal?.percentual || 0).toFixed(1)}%</p>
            </div>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Gráfico de Evolução */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Evolução Mensal</h3>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={dadosEvolucao} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis 
                  dataKey="mes" 
                  tick={{ fontSize: 11, fill: '#64748b' }} 
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 10, fill: '#64748b' }} 
                  tickFormatter={formatarEixo}
                  width={80}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  formatter={(value) => formatarValor(Number(value))}
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: 'none', 
                    borderRadius: '12px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
                  }}
                  labelStyle={{ color: '#94a3b8', fontWeight: 500 }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: 20 }}
                  iconType="circle"
                />
                <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="5 5" strokeWidth={1.5} />
                <Line 
                  type="monotone" 
                  dataKey="Resultado Operacional" 
                  stroke={CORES.operacional} 
                  strokeWidth={3} 
                  dot={{ r: 5, fill: CORES.operacional, strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 7, fill: CORES.operacional, strokeWidth: 3, stroke: '#fff' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="Com Investimentos" 
                  stroke={CORES.investimentos} 
                  strokeWidth={3} 
                  dot={{ r: 5, fill: CORES.investimentos, strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 7, fill: CORES.investimentos, strokeWidth: 3, stroke: '#fff' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="Com Receita Não Operacional" 
                  stroke={CORES.final} 
                  strokeWidth={3} 
                  dot={{ r: 5, fill: CORES.final, strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 7, fill: CORES.final, strokeWidth: 3, stroke: '#fff' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico de Barras Acumulado */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Acumulado no Período</h3>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={dadosBarras} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                <defs>
                  <linearGradient id="barOperacional" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#7c3aed"/>
                    <stop offset="100%" stopColor="#a78bfa"/>
                  </linearGradient>
                  <linearGradient id="barInvestimentos" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#d97706"/>
                    <stop offset="100%" stopColor="#fbbf24"/>
                  </linearGradient>
                  <linearGradient id="barFinal" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#059669"/>
                    <stop offset="100%" stopColor="#34d399"/>
                  </linearGradient>
                  <linearGradient id="barNegativo" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#dc2626"/>
                    <stop offset="100%" stopColor="#f87171"/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} vertical={true} />
                <XAxis 
                  type="number" 
                  tick={{ fontSize: 10, fill: '#64748b' }} 
                  tickFormatter={formatarEixo}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
                />
                <YAxis 
                  type="category" 
                  dataKey="nome" 
                  tick={{ fontSize: 10, fill: '#475569', fontWeight: 500 }} 
                  width={200}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === 'valor') return formatarValor(Number(value))
                    return value
                  }}
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: 'none', 
                    borderRadius: '12px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
                  }}
                  labelStyle={{ color: '#94a3b8', fontWeight: 500 }}
                  itemStyle={{ color: '#fff' }}
                />
                <ReferenceLine x={0} stroke="#94a3b8" strokeDasharray="5 5" strokeWidth={1.5} />
                <Bar dataKey="valor" radius={[0, 8, 8, 0]} barSize={40}>
                  {dadosBarras.map((entry, index) => {
                    let fill = 'url(#barNegativo)'
                    if (entry.valor >= 0) {
                      if (index === 0) fill = 'url(#barOperacional)'
                      else if (index === 1) fill = 'url(#barInvestimentos)'
                      else fill = 'url(#barFinal)'
                    }
                    return <Cell key={index} fill={fill} />
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tabela Detalhada */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <h3 className="text-lg font-bold text-slate-800">Detalhamento por Mês</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800 text-white">
                <tr>
                  <th className="text-left p-4 min-w-[320px] sticky left-0 bg-slate-800 z-10">Resultado</th>
                  {meses.map(mes => (
                    <th key={mes} className="text-right p-4 min-w-[120px]">{mes}</th>
                  ))}
                  <th className="text-right p-4 min-w-[140px] bg-purple-700 sticky right-[80px] z-10">ACUMULADO</th>
                  <th className="text-right p-4 min-w-[80px] bg-purple-800 sticky right-0 z-10">% RECEITA</th>
                </tr>
              </thead>
              <tbody>
                {itens.map((item, idx) => {
                  return (
                    <tr key={item.chave} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-4 sticky left-0 bg-white z-10">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: idx === 0 ? CORES.operacional : idx === 1 ? CORES.investimentos : CORES.final }}></div>
                          <span className="font-semibold text-slate-800">{item.descricao}</span>
                        </div>
                      </td>
                      {meses.map(mes => {
                        const valor = item.valores[mes] || 0
                        return (
                          <td key={mes} className={`p-4 text-right tabular-nums font-medium ${valor >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {formatarValor(valor)}
                          </td>
                        )
                      })}
                      <td className={`p-4 text-right font-bold tabular-nums sticky right-[80px] z-10 ${item.acumulado >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {formatarValor(item.acumulado)}
                      </td>
                      <td className={`p-4 text-right font-bold tabular-nums sticky right-0 z-10 ${item.percentual >= 0 ? 'bg-purple-100 text-purple-700' : 'bg-red-100 text-red-700'}`}>
                        {item.percentual.toFixed(1)}%
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}