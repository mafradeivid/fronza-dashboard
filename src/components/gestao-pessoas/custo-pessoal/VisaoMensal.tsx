'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { CustoMensal } from '@/types/custoPessoal'
import { formatarMoeda } from '@/utils/formatters'

interface VisaoMensalProps {
  custosMensais: CustoMensal[]
}

// Cores
const CORES = {
  salarios: '#3b82f6',
  outros: '#8b5cf6',
  encargos: '#f59e0b',
  provisoes: '#10b981',
  extras: '#ec4899',
}

export function VisaoMensal({ custosMensais }: VisaoMensalProps) {
  // Dados para o gráfico
  const dadosGrafico = custosMensais.map(mes => ({
    name: mes.competenciaLabel,
    Salários: mes.salarios,
    Outros: mes.outrosProventos,
    Encargos: mes.totalEncargos,
    Provisões: mes.totalProvisoes,
    Extras: mes.pagamentosExtras,
    total: mes.custoTotal,
  }))

  // Calcular máximo para escala
  const maxValor = Math.max(...custosMensais.map(m => m.custoTotal))
  const escalaMax = Math.ceil(maxValor / 1000) * 1000 + 2000

  // Formatador de valores para o eixo Y
  const formatarEixoY = (valor: number) => {
    if (valor >= 1000000) return `${(valor / 1000000).toFixed(1)}M`
    if (valor >= 1000) return `${(valor / 1000).toFixed(0)}k`
    return valor.toString()
  }

  return (
    <div className="space-y-6">
      {/* Gráfico de Barras Empilhadas */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Evolução Mensal do Custo</h3>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={dadosGrafico} 
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12, fill: '#64748b' }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={false}
              />
              <YAxis 
                tickFormatter={formatarEixoY}
                tick={{ fontSize: 12, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
                domain={[0, escalaMax]}
              />
              <Tooltip 
                formatter={(value) => formatarMoeda(Number(value) || 0)}
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
                cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="circle"
                iconSize={10}
              />
              <Bar dataKey="Salários" stackId="a" fill={CORES.salarios} radius={[0, 0, 0, 0]} />
              <Bar dataKey="Outros" stackId="a" fill={CORES.outros} />
              <Bar dataKey="Encargos" stackId="a" fill={CORES.encargos} />
              <Bar dataKey="Provisões" stackId="a" fill={CORES.provisoes} />
              <Bar dataKey="Extras" stackId="a" fill={CORES.extras} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabela Mensal */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800">Detalhamento Mês a Mês</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Mês</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-600">Salários</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-600">Outros</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-600">Encargos</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-600">Provisões</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-600">Extras</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-800 bg-slate-100">TOTAL</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-slate-600">Variação</th>
              </tr>
            </thead>
            <tbody>
              {custosMensais.map((mes) => (
                <tr key={mes.competenciaLabel} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4 text-sm font-medium text-slate-800">
                    {mes.competenciaLabel}
                  </td>
                  <td className="text-right py-3 px-4 text-sm text-slate-600">
                    {formatarMoeda(mes.salarios)}
                  </td>
                  <td className="text-right py-3 px-4 text-sm text-slate-600">
                    {formatarMoeda(mes.outrosProventos)}
                  </td>
                  <td className="text-right py-3 px-4 text-sm text-slate-600">
                    {formatarMoeda(mes.totalEncargos)}
                  </td>
                  <td className="text-right py-3 px-4 text-sm text-slate-600">
                    {formatarMoeda(mes.totalProvisoes)}
                  </td>
                  <td className="text-right py-3 px-4 text-sm text-slate-600">
                    {formatarMoeda(mes.pagamentosExtras)}
                  </td>
                  <td className="text-right py-3 px-4 text-sm font-bold text-slate-800 bg-slate-50">
                    {formatarMoeda(mes.custoTotal)}
                  </td>
                  <td className="text-center py-3 px-4">
                    {mes.variacaoPercentual !== null ? (
                      <span className={`
                        inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
                        ${mes.variacaoPercentual > 0 
                          ? 'bg-red-50 text-red-700' 
                          : mes.variacaoPercentual < 0 
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-slate-50 text-slate-600'
                        }
                      `}>
                        {mes.variacaoPercentual > 0 ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : mes.variacaoPercentual < 0 ? (
                          <TrendingDown className="w-3 h-3" />
                        ) : (
                          <Minus className="w-3 h-3" />
                        )}
                        {mes.variacaoPercentual > 0 ? '+' : ''}{mes.variacaoPercentual.toFixed(1)}%
                      </span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}