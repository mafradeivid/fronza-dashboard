'use client'

import { useEffect, useState } from 'react'
import { buscarTodosMeses } from '@/services/dreService'
import { ItemDetalhado } from '@/services/detalhamentoService'
import { extrairInvestimentos } from '@/services/investimentosService'
import { Wallet, ChevronDown, ChevronRight, Download } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import * as XLSX from 'xlsx'

const CORES = ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe']

export default function InvestimentosPage() {
  const [itens, setItens] = useState<ItemDetalhado[]>([])
  const [meses, setMeses] = useState<string[]>([])
  const [totalGeral, setTotalGeral] = useState(0)
  const [carregando, setCarregando] = useState(true)
  const [expandidos, setExpandidos] = useState<Set<number>>(new Set())

  useEffect(() => {
    async function carregar() {
      setCarregando(true)
      const todosMeses = await buscarTodosMeses()
      
      const dadosPorMes = todosMeses.map(m => ({
        label: m.label,
        dados: m.dados
      }))

      const { itens, meses, totalGeral } = extrairInvestimentos(dadosPorMes)
      
      setItens(itens)
      setMeses(meses)
      setTotalGeral(totalGeral)
      setCarregando(false)
    }
    carregar()
  }, [])

  const toggleExpandir = (ordem: number) => {
    setExpandidos(prev => {
      const novos = new Set(prev)
      if (novos.has(ordem)) {
        novos.delete(ordem)
      } else {
        novos.add(ordem)
      }
      return novos
    })
  }

  const formatarValor = (valor: number) => {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
  }

  const exportarExcel = () => {
    const dadosExcel = [
      ['Conta', ...meses, 'ACUMULADO', '% TOTAL'],
      ...itens.map(item => [
        '  '.repeat(item.hierarquia - 1) + item.descricao,
        ...meses.map(m => item.valores[m] || 0),
        item.acumulado,
        item.percentual.toFixed(2) + '%'
      ])
    ]

    const ws = XLSX.utils.aoa_to_sheet(dadosExcel)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Investimentos')
    XLSX.writeFile(wb, 'detalhamento_investimentos_tophaus.xlsx')
  }

  // Encontrar os pais de cada item
  const encontrarPais = () => {
    const pais: { [ordem: number]: { paiH1: number | null; paiH2: number | null } } = {}
    
    let ultimoH1: number | null = null
    let ultimoH2: number | null = null
    
    for (let i = 0; i < itens.length; i++) {
      const item = itens[i]
      
      if (item.hierarquia === 1) {
        ultimoH1 = item.ordem
        ultimoH2 = null
        pais[item.ordem] = { paiH1: null, paiH2: null }
      } else if (item.hierarquia === 2) {
        ultimoH2 = item.ordem
        pais[item.ordem] = { paiH1: ultimoH1, paiH2: null }
      } else if (item.hierarquia === 3) {
        pais[item.ordem] = { paiH1: ultimoH1, paiH2: ultimoH2 }
      }
    }
    
    return pais
  }

  const paisMap = encontrarPais()

  // Organizar itens para exibição
  const organizarParaExibicao = () => {
    const resultado: { item: ItemDetalhado; visivel: boolean; temFilhos: boolean }[] = []
    
    for (let i = 0; i < itens.length; i++) {
      const item = itens[i]
      const pais = paisMap[item.ordem]
      
      let temFilhos = false
      if (i < itens.length - 1) {
        temFilhos = itens[i + 1].hierarquia > item.hierarquia
      }

      let visivel = false
      
      if (item.hierarquia === 1) {
        visivel = true
      } 
      else if (item.hierarquia === 2) {
        visivel = pais.paiH1 !== null && expandidos.has(pais.paiH1)
      }
      else if (item.hierarquia === 3) {
        const paiH1Expandido = pais.paiH1 !== null && expandidos.has(pais.paiH1)
        const paiH2Expandido = pais.paiH2 !== null && expandidos.has(pais.paiH2)
        visivel = paiH1Expandido && paiH2Expandido
      }

      resultado.push({ item, visivel, temFilhos })
    }

    return resultado
  }

  const itensParaExibir = organizarParaExibicao()

// Dados para gráficos (usar H2 para mais detalhes)
const dadosPizza = itens
  .filter(i => i.hierarquia === 2)
    .map(i => ({ nome: i.descricao, valor: Math.abs(i.acumulado) }))

  const itensHierarquia1 = itens.filter(i => i.hierarquia === 2)
  const dadosBarras = [...meses].reverse().map(mes => {
    const obj: { [key: string]: string | number } = { mes }
    itensHierarquia1.forEach(item => {
      obj[item.descricao] = Math.abs(item.valores[mes] || 0)
    })
    return obj
  })

  if (carregando) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-violet-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-violet-600 border-t-transparent animate-spin"></div>
          </div>
          <p className="text-slate-600 font-medium">Carregando investimentos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-violet-500 to-violet-600 p-2 rounded-xl">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">Detalhamento de Investimentos</h1>
                <p className="text-sm text-slate-500">Análise por tipo e período</p>
              </div>
            </div>
            <button
              onClick={exportarExcel}
              className="flex items-center gap-2 bg-violet-600 text-white px-4 py-2.5 rounded-xl hover:bg-violet-700 transition-colors font-medium text-sm"
            >
              <Download className="w-4 h-4" />
              Exportar Excel
            </button>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Cards resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-violet-500 to-violet-600 rounded-2xl p-5 text-white">
            <p className="text-violet-100 text-sm font-medium">Total Acumulado</p>
            <p className="text-3xl font-bold mt-1">{formatarValor(Math.abs(totalGeral))}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-200">
            <p className="text-slate-500 text-sm font-medium">Tipos de Investimento</p>
            <p className="text-3xl font-bold text-slate-800 mt-1">{itensHierarquia1.length}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-200">
            <p className="text-slate-500 text-sm font-medium">Período Analisado</p>
            <p className="text-3xl font-bold text-slate-800 mt-1">{meses.length} meses</p>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Gráfico Pizza */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Composição dos Investimentos</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dadosPizza}
                  dataKey="valor"
                  nameKey="nome"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  label={({ percent }) => `${((percent || 0) * 100).toFixed(1)}%`}
                >
                  {dadosPizza.map((_, index) => (
                    <Cell key={index} fill={CORES[index % CORES.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatarValor(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-3 mt-4">
              {dadosPizza.map((item, idx) => (
                <div key={item.nome} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CORES[idx % CORES.length] }}></div>
                  <span className="text-xs text-slate-600">{item.nome}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Gráfico Barras */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Evolução Mensal</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dadosBarras}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis 
                  tick={{ fontSize: 11, fill: '#64748b' }} 
                  tickFormatter={(v) => (v / 1000).toFixed(0) + 'K'}
                  width={50}
                />
                <Tooltip formatter={(value) => formatarValor(Number(value))} />
                {itensHierarquia1.map((item, idx) => (
                  <Bar key={item.descricao} dataKey={item.descricao} stackId="a" fill={CORES[idx % CORES.length]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tabela Detalhada */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <h3 className="text-lg font-bold text-slate-800">Detalhamento por Conta</h3>
            <p className="text-sm text-slate-500">Clique nas linhas para expandir/recolher</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800 text-white sticky top-0">
                <tr>
                  <th className="text-left p-4 min-w-[280px] sticky left-0 bg-slate-800 z-10">Conta</th>
                  {meses.map(mes => (
                    <th key={mes} className="text-right p-4 min-w-[110px]">{mes}</th>
                  ))}
                  <th className="text-right p-4 min-w-[130px] bg-violet-700 sticky right-[100px] z-10">ACUMULADO</th>
                  <th className="text-right p-4 min-w-[100px] bg-violet-800 sticky right-0 z-10">% TOTAL</th>
                </tr>
              </thead>
              <tbody>
                {itensParaExibir.map(({ item, visivel, temFilhos }) => {
                  if (!visivel) return null

                  const isExpandido = expandidos.has(item.ordem)
                  const isClicavel = temFilhos

                  const getBgColor = () => {
                    if (item.hierarquia === 1) return 'bg-slate-100'
                    if (item.hierarquia === 2) return 'bg-slate-50'
                    return 'bg-white'
                  }

                  return (
                    <tr 
                      key={item.ordem}
                      className={`border-b border-slate-100 transition-colors hover:bg-slate-200 ${getBgColor()} ${isClicavel ? 'cursor-pointer' : ''}`}
                      onClick={() => isClicavel && toggleExpandir(item.ordem)}
                    >
                      <td className={`p-4 sticky left-0 z-10 ${getBgColor()}`}>
                        <div className="flex items-center gap-2" style={{ paddingLeft: `${(item.hierarquia - 1) * 24}px` }}>
                          {isClicavel ? (
                            isExpandido 
                              ? <ChevronDown className="w-4 h-4 text-slate-500 flex-shrink-0" />
                              : <ChevronRight className="w-4 h-4 text-slate-500 flex-shrink-0" />
                          ) : (
                            <span className="w-4 h-4 flex-shrink-0"></span>
                          )}
                          <span className={item.hierarquia === 1 ? 'font-semibold text-slate-800' : item.hierarquia === 2 ? 'font-medium text-slate-700' : 'text-slate-600'}>
                            {item.descricao}
                          </span>
                        </div>
                      </td>
                      {meses.map(mes => (
                        <td key={mes} className="p-4 text-right tabular-nums text-slate-700">
                          {formatarValor(item.valores[mes] || 0)}
                        </td>
                      ))}
                      <td className={`p-4 text-right font-semibold tabular-nums sticky right-[100px] z-10 ${item.hierarquia === 1 ? 'bg-violet-100 text-violet-800' : 'bg-violet-50 text-violet-700'}`}>
                        {formatarValor(item.acumulado)}
                      </td>
                      <td className={`p-4 text-right font-semibold sticky right-0 z-10 ${item.hierarquia === 1 ? 'bg-violet-200 text-violet-800' : 'bg-violet-100 text-violet-700'}`}>
                        {item.percentual.toFixed(1)}%
                      </td>
                    </tr>
                  )
                })}
                {/* Linha Total */}
                <tr className="bg-violet-600 text-white font-bold">
                  <td className="p-4 sticky left-0 bg-violet-600 z-10">TOTAL GERAL</td>
                  {meses.map(mes => {
                    const totalMes = itens
                      .filter(i => i.hierarquia === 1)
                      .reduce((acc, i) => acc + (i.valores[mes] || 0), 0)
                    return (
                      <td key={mes} className="p-4 text-right tabular-nums">{formatarValor(totalMes)}</td>
                    )
                  })}
                  <td className="p-4 text-right sticky right-[100px] bg-violet-700 z-10">{formatarValor(totalGeral)}</td>
                  <td className="p-4 text-right sticky right-0 bg-violet-800 z-10">100%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}