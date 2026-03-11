'use client'

import { ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, ReferenceLine } from 'recharts'
import { ResumoMensal } from '@/services/dreService'

interface GraficoReceitaDespesaProps {
  dados: ResumoMensal[]
  titulo: string
}

export function GraficoReceitaDespesa({ dados, titulo }: GraficoReceitaDespesaProps) {
  // Inverter para ordem cronológica (mais antigo primeiro)
  const dadosOrdenados = [...dados].reverse()

  const dadosGrafico = dadosOrdenados.map(d => ({
    mes: d.label,
    Receitas: d.totalReceitas,
    Despesas: d.totalDespesas,
    Resultado: d.resultadoOperacao,
  }))

  const formatarValor = (valor: number) => {
    if (valor >= 1000000) {
      return (valor / 1000000).toFixed(1) + 'M'
    }
    if (valor >= 1000) {
      return (valor / 1000).toFixed(0) + 'mil'
    }
    return valor.toFixed(0)
  }

  const formatarTooltip = (valor: number) => {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
      <h3 className="text-lg font-bold text-slate-800 mb-4">{titulo}</h3>
      <ResponsiveContainer width="100%" height={350}>
        <ComposedChart data={dadosGrafico}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis 
            dataKey="mes" 
            tick={{ fontSize: 12, fill: '#64748b' }}
            axisLine={{ stroke: '#e2e8f0' }}
            tickLine={false}
          />
          <YAxis 
            tick={{ fontSize: 11, fill: '#64748b' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={formatarValor}
            width={60}
          />
          <Tooltip 
            formatter={(value) => formatarTooltip(Number(value))}
            contentStyle={{ 
              backgroundColor: '#1e293b', 
              border: 'none', 
              borderRadius: '8px',
              color: '#fff'
            }}
            cursor={{ fill: 'rgba(0,0,0,0.05)' }}
          />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="circle"
            iconSize={10}
          />
          <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" />
          <Bar dataKey="Receitas" fill="#10b981" radius={[4, 4, 0, 0]} barSize={30} />
          <Bar dataKey="Despesas" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={30} />
          <Line 
            type="monotone" 
            dataKey="Resultado" 
            stroke="#3b82f6" 
            strokeWidth={3}
            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 5 }}
            activeDot={{ r: 7, fill: '#3b82f6' }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}